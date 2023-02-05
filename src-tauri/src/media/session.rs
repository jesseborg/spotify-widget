use std::sync::{Arc, Mutex};

use tailwind_palette::TailwindPalette;
use windows::core::{Error as WindowsError, HRESULT};
use windows::Foundation::{EventRegistrationToken, TypedEventHandler};
use windows::Media::Control::{
  GlobalSystemMediaTransportControlsSession,
  GlobalSystemMediaTransportControlsSessionPlaybackStatus as WindowsPlaybackStatus,
  MediaPropertiesChangedEventArgs,
  PlaybackInfoChangedEventArgs,
  TimelinePropertiesChangedEventArgs,
};
use windows_volume_mixer::events::EventCallbacks;
use windows_volume_mixer::{AudioSessionControl, AudioSessionManager};

use super::lib::EventBus;
use crate::media::lib::{
  MediaEvent,
  MediaPlaybackData,
  MediaSessionData,
  MediaTimelineData,
  ThumbnailData,
};
use crate::utils::thumbnail::get_thumbnail_data;

type ThreadSafeOption<T> = Arc<Mutex<Option<T>>>;

// #[derive(Debug)]
pub struct Session {
  pub app_id: String,
  controls: GlobalSystemMediaTransportControlsSession,
  media_properites_event_token: EventRegistrationToken,
  playback_info_event_token: EventRegistrationToken,
  timeline_properties_event_token: EventRegistrationToken,
  pub event_bus: Arc<EventBus>,
	#[allow(dead_code)]
	audio_manager: Option<AudioSessionManager>,
	audio_control: ThreadSafeOption<AudioSessionControl>
}

impl Session {
  pub fn new(
    controls: GlobalSystemMediaTransportControlsSession,
    event_bus: Arc<EventBus>,
  ) -> Self {
    println!("[MediaSession] new");

    Self {
      app_id: controls.SourceAppUserModelId().unwrap().to_string(),
      controls,
      media_properites_event_token: EventRegistrationToken::default(),
      playback_info_event_token: EventRegistrationToken::default(),
      timeline_properties_event_token: EventRegistrationToken::default(),
      event_bus,
			audio_manager: None,
			audio_control: Arc::new(Mutex::new(None))
    }
  }

  fn media_properties_handler(
    &self,
  ) -> TypedEventHandler<GlobalSystemMediaTransportControlsSession, MediaPropertiesChangedEventArgs>
  {
		println!("[MediaSession] media_properties_handler");
    TypedEventHandler::<
      GlobalSystemMediaTransportControlsSession,
      MediaPropertiesChangedEventArgs,
    >::new({
			let event_sender = self.event_bus.0.clone();
		
			self.invoke_playback_info_handler();
			self.invoke_timeline_properties_handler();

      move |sender, _args| {
        match futures::executor::block_on(async {
          let Some(session) = sender else {
						return Ok::<(), windows::core::Error>(());
					};

          let Ok(props) = session.TryGetMediaPropertiesAsync()?.await else {
						return Ok(());
					};

          let Ok(playback) = session.GetPlaybackInfo() else {
						return Ok(());
					};

          let Ok(controls) = playback.Controls() else {
						return Ok(());
					};

          // Wait for thumbnail to be encoded
          let (palette, thumbnail) =
            get_thumbnail_data(props.Thumbnail()).await.unwrap_or((
							None, "".into()
						));

					let (prominant_color, shades) = if let Some(palette) = palette {
						let (r, g, b) = palette.most_prominent_color().unwrap_or((245, 245, 245));
						println!("RGB: {r} {g} {b}");
						let tailwind_palette = TailwindPalette::new(format!("rgb({},{},{})", r, g, b).as_str());

						((r, g, b), tailwind_palette)
					} else {
						(
							(245, 245, 245),
							TailwindPalette::new("rgb(245,245,245)")
						)
					};

          event_sender.send(MediaEvent::MediaPropertiesChanged(
            MediaSessionData {
              is_play_enabled: controls.IsPlayEnabled().unwrap(),
              is_pause_enabled: controls.IsPauseEnabled().unwrap(),
              is_play_or_pause_enabled: controls.IsPlayEnabled().unwrap() || controls.IsPauseEnabled().unwrap(),
              is_previous_enabled: controls.IsPreviousEnabled().unwrap(),
              is_next_enabled: controls.IsNextEnabled().unwrap(),
              title: props.Title().unwrap().to_string(),
              artist: props.Artist().unwrap().to_string(),
              thumbnail: ThumbnailData {
                base64: thumbnail,
                palette: shades.unwrap(),
								prominant_color
              }
            },
          )).unwrap();

          Ok(())
        }) {
          Ok(()) => Ok(()),
          Err(_) => Err(WindowsError::new(HRESULT(0), "".into())),
        }
      }
    })
  }

  fn playback_info_handler(
    &self,
  ) -> TypedEventHandler<GlobalSystemMediaTransportControlsSession, PlaybackInfoChangedEventArgs>
  {
		println!("[MediaSession] playback_info_handler");
    TypedEventHandler::<
      GlobalSystemMediaTransportControlsSession,
      PlaybackInfoChangedEventArgs,
    >::new({
			let event_sender = self.event_bus.0.clone();

      move |sender, _args| {
        futures::executor::block_on(async {
					let Ok(playback_info) = sender.as_ref().unwrap().GetPlaybackInfo() else {
						return Ok::<(), windows::core::Error>(());
					};

					event_sender.send(MediaEvent::PlaybackInfoChanged(
						MediaPlaybackData {
							is_playing: playback_info.PlaybackStatus().unwrap() == WindowsPlaybackStatus::Playing,
						}
					)).unwrap();

					Ok(())
				}).unwrap();

        Ok(())
      }
    })
  }

  fn timeline_properties_handler(
    &self,
  ) -> TypedEventHandler<
    GlobalSystemMediaTransportControlsSession,
    TimelinePropertiesChangedEventArgs,
  > {
		println!("[MediaSession] timeline_properties_handler");
    TypedEventHandler::<
      GlobalSystemMediaTransportControlsSession,
      TimelinePropertiesChangedEventArgs,
    >::new({
			let event_sender = self.event_bus.0.clone();

      move |sender, _args| {
        futures::executor::block_on(async {
					let Ok(timeline) = sender.as_ref().unwrap().GetTimelineProperties() else {
						return Ok::<(), windows::core::Error>(());
					};

					event_sender.send(MediaEvent::TimelinePropertiesChanged(
						MediaTimelineData {
							timeline_start_time: timeline.StartTime().unwrap().Duration as usize,
							timeline_end_time: timeline.EndTime().unwrap().Duration as usize,
							timeline_position: timeline.Position().unwrap().Duration as usize,
						}
					)).unwrap();

					Ok(())
				}).unwrap();
        Ok(())
      }
    })
  }

  pub fn invoke_media_properties_handler(&self) {
		println!("[MediaSession] invoke_media_properties_handler");
    self
      .media_properties_handler()
      .Invoke(&self.controls, None)
      .unwrap();
  }

  pub fn invoke_playback_info_handler(&self) {
		println!("[MediaSession] invoke_playback_info_handler");
    self
      .playback_info_handler()
      .Invoke(&self.controls, None)
      .unwrap();
  }

  pub fn invoke_timeline_properties_handler(&self) {
		println!("[MediaSession] invoke_timeline_properties_handler");
    self
      .timeline_properties_handler()
      .Invoke(&self.controls, None)
      .unwrap();
  }

  pub fn build(mut self) -> Self {
    println!("[MediaSession] build");

		let audio_control = Arc::new(Mutex::new(None));
		let audio_manager = AudioSessionManager::new()
			.map(|mut audio_manager| {
				let app_name = self.app_id.clone();
				let event_sender = self.event_bus.0.clone();
				let audio_control = audio_control.clone();

				audio_manager.on_session_created(move |session| {
					let event_sender = event_sender.clone();

					if let Ok(process_name) = session.process_name() {
						println!("Session: {process_name}");
						
						if process_name != app_name {
							return;
						}

						let volume = session.volume_control().get_volume();
						event_sender.send(MediaEvent::VolumeChanged(volume)).unwrap();

						session.register_session_notification(
							EventCallbacks::new()
								.on_volume_changed(move |volume, _, _| {
									event_sender.send(MediaEvent::VolumeChanged(volume)).unwrap();
								})
								.build(),
						).unwrap();

						*audio_control.lock().unwrap() = Some(session);
					}
				}).unwrap();

				audio_manager
			})
			.map_err(|e| println!("Session::new | audio_manager: {:?}", e))
			.unwrap();

		self.audio_manager = Some(audio_manager);
		self.audio_control = audio_control;

    self.media_properites_event_token = self
      .controls
      .MediaPropertiesChanged(&self.media_properties_handler())
      .unwrap();

    self.playback_info_event_token = self
      .controls
      .PlaybackInfoChanged(&self.playback_info_handler())
      .unwrap();

    self.timeline_properties_event_token = self
      .controls
      .TimelinePropertiesChanged(&self.timeline_properties_handler())
      .unwrap();

    self
      .event_bus
      .0
      .send(MediaEvent::Connect(self.app_id.to_owned()))
      .unwrap();

		self
  }

  #[allow(dead_code)]
  pub fn disconnect(&self) {
    println!("[MediaSession] '{}' disconnected", self.app_id);

    self
      .controls
      .RemoveMediaPropertiesChanged(self.media_properites_event_token)
      .unwrap();
    self
      .controls
      .RemovePlaybackInfoChanged(self.playback_info_event_token)
      .unwrap();
    self
      .controls
      .RemoveTimelinePropertiesChanged(self.timeline_properties_event_token)
      .unwrap();

    self
      .event_bus
      .0
      .send(MediaEvent::Disconnect(self.app_id.to_owned()))
      .unwrap();
  }

  pub fn play(&self) {
    println!("tried to play");
    self.controls.TryPlayAsync().unwrap();
  }

  pub fn pause(&self) {
    println!("tried to pause");
    self.controls.TryPauseAsync().unwrap();
  }

  pub fn skip_next(&self) {
    println!("tried to skip next");
    self.controls.TrySkipNextAsync().unwrap();
  }

  pub fn skip_previous(&self) {
    println!("tried to skip previous");
    self.controls.TrySkipPreviousAsync().unwrap();
  }

  pub fn set_playback_position(&self, value: i64) {
    println!("tried to set playback position: {}", value);
    self.controls.TryChangePlaybackPositionAsync(value).unwrap();
  }

  pub fn get_volume(&self) -> f32 {
    println!("tried to get volume");

		if let Some(session) = self.audio_control.lock().unwrap().as_ref() {
			return session.volume_control().get_volume()
		}

    -1.0
  }

  pub fn set_volume(&self, volume: f32) {
    println!("tried to set volume: {volume}");

		if let Some(session) = self.audio_control.lock().unwrap().as_ref() {
			session.volume_control().set_volume(volume).unwrap();
		}
  }
}
