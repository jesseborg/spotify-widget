use prominence::Swatch;
use serde::{Deserialize, Serialize};
use tailwind_palette::TailwindPalette;
use tokio::sync::broadcast;

pub type EventBus = (broadcast::Sender<MediaEvent>, broadcast::Receiver<MediaEvent>);

#[derive(Debug, Serialize, PartialEq, Clone, rspc::Type)]
#[serde(rename_all = "camelCase")]
pub enum MediaEvent {
  Connect(String),
  Disconnect(String),
  MediaPropertiesChanged(MediaSessionData),
  PlaybackInfoChanged(MediaPlaybackData),
  TimelinePropertiesChanged(MediaTimelineData),
  VolumeChanged(f32),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, rspc::Type)]
#[serde(rename_all = "camelCase")]
pub struct MediaPlaybackData {
  pub is_playing: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, rspc::Type)]
#[serde(rename_all = "camelCase")]
pub struct MediaTimelineData {
  pub timeline_start_time: usize,
  pub timeline_end_time: usize,
  pub timeline_position: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, rspc::Type)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailData {
  pub base64: String,
  pub palette: TailwindPalette,
  pub prominant_color: (u8, u8, u8),
	pub average_color: (u8, u8, u8),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, rspc::Type)]
#[serde(rename_all = "camelCase")]
pub struct MediaSessionData {
  pub is_play_enabled: bool,
  pub is_pause_enabled: bool,
  pub is_play_or_pause_enabled: bool,
  pub is_previous_enabled: bool,
  pub is_next_enabled: bool,
  pub title: String,
  pub artist: String,
	pub album: String,
  pub thumbnail: ThumbnailData,
}
