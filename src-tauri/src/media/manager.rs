use std::borrow::Borrow;
use std::sync::{Arc, Mutex, MutexGuard};

use windows::Foundation::TypedEventHandler;
use windows::Media::Control::{
  GlobalSystemMediaTransportControlsSession,
  GlobalSystemMediaTransportControlsSessionManager,
  SessionsChangedEventArgs,
};

use super::lib::EventBus;
use super::session::Session;

pub struct MediaManager {
  event_bus: Arc<EventBus>,
  manager: GlobalSystemMediaTransportControlsSessionManager,
  session: Arc<Mutex<Option<Session>>>,
}

impl MediaManager {
  pub fn new(event_bus: Arc<EventBus>) -> windows::core::Result<Self> {
    println!("[MediaManager] new");
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()?.get()?;

    Ok(Self {
			manager,
			session: Arc::new(Mutex::new(None)),
      event_bus,
    })
  }

  pub fn get_session(&self) -> MutexGuard<'_, Option<Session>> { self.session.lock().unwrap() }

  pub fn build(self) -> anyhow::Result<Self> {
    println!("[MediaManager] build");

    let sessions_changed_handler = &TypedEventHandler::<
      GlobalSystemMediaTransportControlsSessionManager,
      SessionsChangedEventArgs,
    >::new({
      // let inner = self.inner.clone();
			let session = self.session.clone();
      let event_bus = self.event_bus.clone();

      move |sender, _| {
        let Some(manager) = sender else {
					return Ok(());
				};

        let Ok(sessions) = manager.GetSessions() else {
					return Ok(());
				};

        if let Some(active_session) = sessions
					.borrow()
					.into_iter()
					.filter(has_spotify)
					.collect::<Vec<GlobalSystemMediaTransportControlsSession>>()
					.first() {
						if session.lock().unwrap().as_ref().is_some() {
							println!("session already exists");
							return Ok(())
						}

						if let Ok(new_session) = Session::new(active_session.clone(), event_bus.clone()).build() {
							*session.lock().unwrap() = Some(new_session);
						}
						return Ok(())
					}
					
				// If Spotify is no longer active and 'session' is still allocated
				// send disconnect event and deallocate
				if let Ok(mut session) = session.lock() {
					if let Some(media_session) = session.as_ref() {
						media_session.disconnect().unwrap();
						*session = None;
					}
				}

        Ok(())
      }
    });

    self
      .manager
      .SessionsChanged(sessions_changed_handler)?;

    // Manually Invoke the handler to force check a session on startup
    sessions_changed_handler
      .Invoke(&self.manager, None)?;

    Ok(self)
  }

  pub fn arced(self) -> Arc<Self> { Arc::new(self) }
}

fn has_spotify(session: &GlobalSystemMediaTransportControlsSession) -> bool {
  session.SourceAppUserModelId().unwrap() == "Spotify.exe"
}
