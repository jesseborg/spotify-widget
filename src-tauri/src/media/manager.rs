use std::borrow::Borrow;
use std::sync::{Arc, Mutex, MutexGuard};

use windows::core::{Error as WindowsError, HRESULT};
use windows::Foundation::TypedEventHandler;
use windows::Media::Control::{
  GlobalSystemMediaTransportControlsSession,
  GlobalSystemMediaTransportControlsSessionManager,
  SessionsChangedEventArgs,
};

use super::lib::EventBus;
use super::session::Session;

pub struct InnerMediaManager {
  manager: GlobalSystemMediaTransportControlsSessionManager,
  pub session: Arc<Mutex<Option<Session>>>,
}

impl InnerMediaManager {
  pub fn get_session(&self) -> MutexGuard<'_, Option<Session>> { self.session.lock().unwrap() }
  pub fn set_session(&self, session: Option<Session>) { *self.session.lock().unwrap() = session; }
}

pub struct MediaManager {
  pub inner: Arc<InnerMediaManager>,
  event_bus: Arc<EventBus>,
}

#[derive(Debug)]
pub struct Error(WindowsError);

impl From<WindowsError> for Error {
  fn from(other: WindowsError) -> Error { Error(other) }
}

impl MediaManager {
  pub fn new(event_bus: Arc<EventBus>) -> Result<Self, Error> {
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()?.get()?;

    Ok(Self {
      inner: Arc::new(InnerMediaManager {
        manager,
        session: Arc::new(Mutex::new(None)),
      }),
      event_bus,
    })
  }

  pub fn get_session(&self) -> MutexGuard<'_, Option<Session>> { self.inner.get_session() }

  pub fn arced(self) -> Arc<Self> { Arc::new(self) }

  pub fn build(self) -> Self {
    println!("[MediaManager] build");

    let sessions_changed_handler = &TypedEventHandler::<
      GlobalSystemMediaTransportControlsSessionManager,
      SessionsChangedEventArgs,
    >::new({
      let inner = self.inner.clone();
      let event_bus = self.event_bus.clone();

      move |sender, _| {
        let Some(manager) = sender else {
					return Ok(());
				};

        let Ok(sessions) = manager.GetSessions() else {
					return Err(WindowsError::new(HRESULT(0), "Could not find a session.".into()));
				};

        sessions
          .borrow()
          .into_iter()
          .filter(has_spotify)
          .for_each(|session| {
            if inner.get_session().is_some() {
              println!("session exists already");
              return
            }

            inner.set_session(Some(Session::new(session, event_bus.clone()).build()));
          });

        let spotify_is_active = sessions
					.borrow()
					.into_iter()
					.any(|s| has_spotify(&s));

        // If Spotify is not active, but the Session is. Emit 'Disconnect' event
        if inner.get_session().is_some() && !spotify_is_active {
          inner.get_session().as_ref().unwrap().disconnect();
          inner.set_session(None);
        }

        Ok(())
      }
    });

    self
      .inner
      .manager
      .SessionsChanged(sessions_changed_handler)
      .unwrap();

    /* Manually Invoke the handler to force check a session on startup */
    sessions_changed_handler
      .Invoke(&self.inner.manager, None)
      .unwrap();

    self
  }
}

fn has_spotify(session: &GlobalSystemMediaTransportControlsSession) -> bool {
  session.SourceAppUserModelId().unwrap() == "Spotify.exe"
}
