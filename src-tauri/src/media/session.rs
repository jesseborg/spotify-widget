use std::sync::Arc;

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

use super::lib::EventBus;
use crate::media::lib::{
  MediaEvent,
  MediaPlaybackData,
  MediaSessionData,
  MediaTimelineData,
  ThumbnailData,
};
use crate::media::manager::Error;
use crate::utils::thumbnail::get_thumbnail_data;

#[derive(Debug)]
pub struct Session {
  pub app_id: String,
  controls: GlobalSystemMediaTransportControlsSession,
  media_properites_event_token: EventRegistrationToken,
  playback_info_event_token: EventRegistrationToken,
  timeline_properties_event_token: EventRegistrationToken,
  pub event_bus: Arc<EventBus>,
}

impl Session {
  pub fn new(
    controls: GlobalSystemMediaTransportControlsSession,
    event_bus: Arc<EventBus>,
  ) -> Self {
    Self {
      app_id: controls.SourceAppUserModelId().unwrap().to_string(),
      controls,
      media_properites_event_token: EventRegistrationToken::default(),
      playback_info_event_token: EventRegistrationToken::default(),
      timeline_properties_event_token: EventRegistrationToken::default(),
      event_bus,
    }
  }

  fn media_properties_handler(
    &self,
  ) -> TypedEventHandler<GlobalSystemMediaTransportControlsSession, MediaPropertiesChangedEventArgs>
  {
    TypedEventHandler::<
      GlobalSystemMediaTransportControlsSession,
      MediaPropertiesChangedEventArgs,
    >::new({
			let event_sender = self.event_bus.0.clone();

			self.invoke_playback_info_handler();
			self.invoke_timeline_properties_handler();

      move |sender, _args| {
        match futures::executor::block_on(async {
					println!("media session changed");

          let Some(session) = sender else {
						return Ok::<(), Error>(());
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
    TypedEventHandler::<
      GlobalSystemMediaTransportControlsSession,
      PlaybackInfoChangedEventArgs,
    >::new({
			let event_sender = self.event_bus.0.clone();

      move |sender, _args| {
        futures::executor::block_on(async {
					let Ok(playback_info) = sender.as_ref().unwrap().GetPlaybackInfo() else {
						return Ok::<(), Error>(());
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
    TypedEventHandler::<
      GlobalSystemMediaTransportControlsSession,
      TimelinePropertiesChangedEventArgs,
    >::new({
			let event_sender = self.event_bus.0.clone();

      move |sender, _args| {
        futures::executor::block_on(async {
					let Ok(timeline) = sender.as_ref().unwrap().GetTimelineProperties() else {
						return Ok::<(), Error>(());
					};

					println!("[timeline_properties_handler]");

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
    self
      .media_properties_handler()
      .Invoke(&self.controls, None)
      .unwrap();
  }

  pub fn invoke_playback_info_handler(&self) {
    self
      .playback_info_handler()
      .Invoke(&self.controls, None)
      .unwrap();
  }

  pub fn invoke_timeline_properties_handler(&self) {
    self
      .timeline_properties_handler()
      .Invoke(&self.controls, None)
      .unwrap();
  }

  pub fn build(mut self) -> Self {
    println!("[Initialize] MediaSession");

    self
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

  pub fn set_playback_position(&self, value: i64) {
    println!("tried to set playback position: {}", value);
    self.controls.TryChangePlaybackPositionAsync(value).unwrap();
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
}
