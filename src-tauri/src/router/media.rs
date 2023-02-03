use rspc::Type;
use serde::{Deserialize, Serialize};

use super::router::RouterBuilder;
use crate::media::lib::MediaEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
enum Method {
  Play,
  Pause,
  Next,
  Previous,
  SetPlaybackPosition(usize),
  SetVolume(f32),
}

#[derive(Serialize, Deserialize, rspc::Type)]
#[serde(rename_all = "camelCase")]
struct SessionChangedData {
  app_id: String,
  session_active: bool,
}

pub(crate) fn media_router() -> RouterBuilder {
  <RouterBuilder>::new()
    .mutation("invokeMethod", |t| {
      t(|ctx, method: Method| {
        if let Some(session) = ctx.manager.get_session().as_ref() {
          match method {
            Method::Play => session.play(),
            Method::Pause => session.pause(),
            Method::Next => session.skip_next(),
            Method::Previous => session.skip_previous(),
            Method::SetPlaybackPosition(position) => session.set_playback_position(position as i64),
            Method::SetVolume(volume) => session.set_volume(volume),
          };
        }
      })
    })
    .query("getVolume", |t| {
      t(|ctx, _: ()| {
        if let Some(session) = ctx.manager.get_session().as_ref() {
          return session.get_volume()
        }

        0.5
      })
    })
    .subscription("sessionChanged", |t| {
      t(|ctx, _input: ()| {
        async_stream::stream! {
          let mut event_bus = ctx.event_bus.0.subscribe();
          println!("event_bus: {:?}", event_bus);
          while let Ok(event) = event_bus.recv().await {
            match &event {
              MediaEvent::Connect(app_id) => {
                println!("[SessionChanged] {:#?}", event);
                yield SessionChangedData { app_id: app_id.into(), session_active: true };
              },
              MediaEvent::Disconnect(app_id) => {
                println!("[SessionChanged] {:#?}", event);
                yield SessionChangedData { app_id: app_id.into(), session_active: false };
              },
              _ => {}
            }
          }
        }
      })
    })
    .subscription("mediaPropertiesChanged", |t| {
      t(|ctx, _input: ()| {
        async_stream::stream! {
          let mut event_bus = ctx.event_bus.0.subscribe();
          while let Ok(event) = event_bus.recv().await {
            match event {
              MediaEvent::MediaPropertiesChanged(data) => yield data,
              _ => {}
            }
          }
        }
      })
    })
    .subscription("playbackInfoChanged", |t| {
      t(|ctx, _input: ()| {
        async_stream::stream! {
          let mut event_bus = ctx.event_bus.0.subscribe();
          while let Ok(event) = event_bus.recv().await {
            match event {
              MediaEvent::PlaybackInfoChanged(data) => yield data,
              _ => {}
            }
          }
        }
      })
    })
    .subscription("timelinePropertiesChanged", |t| {
      t(|ctx, _input: ()| {
        async_stream::stream! {
          let mut event_bus = ctx.event_bus.0.subscribe();
          while let Ok(event) = event_bus.recv().await {
            match event {
              MediaEvent::TimelinePropertiesChanged(data) => yield data,
              _ => {}
            }
          }
        }
      })
    })
    .subscription("volumeChanged", |t| {
      t(|ctx, _input: ()| {
        async_stream::stream! {
          let mut event_bus = ctx.event_bus.0.subscribe();
          while let Ok(event) = event_bus.recv().await {
            match event {
              MediaEvent::VolumeChanged(data) => yield data,
              _ => {}
            }
          }
        }
      })
    })
    .mutation("invokeMediaProperties", |t| {
      t(|ctx, _: ()| {
        if let Some(session) = ctx.manager.get_session().as_ref() {
          session.invoke_media_properties_handler();
        }
      })
    })
    .mutation("invokePlaybackInfo", |t| {
      t(|ctx, _: ()| {
        if let Some(session) = ctx.manager.get_session().as_ref() {
          session.invoke_playback_info_handler();
        }
      })
    })
    .mutation("invokeTimelineProperties", |t| {
      t(|ctx, _: ()| {
        if let Some(session) = ctx.manager.get_session().as_ref() {
          session.invoke_timeline_properties_handler();
        }
      })
    })
}
