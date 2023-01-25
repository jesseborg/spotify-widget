use std::path::PathBuf;
use std::sync::Arc;

use rspc::Config;
use tokio::sync::broadcast::{Receiver, Sender};

use super::media::media_router;
use crate::media::lib::MediaEvent;
use crate::media::manager::MediaManager;

pub struct Ctx {
  pub manager: Arc<MediaManager>,
  pub event_bus: Arc<(Sender<MediaEvent>, Receiver<MediaEvent>)>,
}

pub type Router = rspc::Router<Ctx>;
pub type RouterBuilder = rspc::RouterBuilder<Ctx>;

pub(crate) fn new() -> Arc<Router> {
  <Router>::new()
    .config(Config::new().export_ts_bindings(
      PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/utils/bindings.ts"),
    ))
    .merge("media.", media_router())
    .build()
    .arced()
}
