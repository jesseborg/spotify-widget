pub mod media;
pub mod spotify;
pub mod network;

use std::path::PathBuf;
use std::sync::Arc;

use rspc::Config;

use self::network::network_router;
use self::spotify::spotify_router;
use self::media::media_router;
use crate::media::lib::EventBus;
use crate::media::manager::MediaManager;


pub struct Ctx {
  pub manager: Arc<MediaManager>,
  pub event_bus: Arc<EventBus>,
}

pub type Router = rspc::Router<Ctx>;
pub type RouterBuilder = rspc::RouterBuilder<Ctx>;

pub(crate) fn new() -> Arc<Router> {
  <Router>::new()
    .config(Config::new().export_ts_bindings(
      PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/utils/bindings.ts"),
    ))
    .merge("media.", media_router())
    .merge("spotify.", spotify_router())
    .merge("network.", network_router())
    .build()
    .arced()
}
