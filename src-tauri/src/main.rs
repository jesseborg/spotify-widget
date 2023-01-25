#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tokio::sync::broadcast;

use crate::media::lib::MediaEvent;

mod router;
use router::router::Ctx;

mod media;
mod utils;

struct InnerAppState {
  initialized: bool,
}
struct AppState(Mutex<InnerAppState>);

fn handle_menu_item_click(id: String) {
  match id.as_str() {
    "quit" => std::process::exit(0),
    _ => {},
  }
}

#[tauri::command]
fn app_ready(app_handle: tauri::AppHandle, state: tauri::State<'_, AppState>) {
  println!("app_ready");

  if state.0.lock().unwrap().initialized {
    return
  }

  let window = app_handle.get_window("main").unwrap();
  window.show().unwrap();

  let router = router::router::new();
  let event_bus = Arc::new(broadcast::channel::<MediaEvent>(1024));
  let manager = media::manager::MediaManager::new(event_bus.clone())
    .unwrap()
    .build()
    .arced();

  app_handle
    .plugin(rspc::integrations::tauri::plugin(router, move || Ctx {
      manager: Arc::clone(&manager),
      event_bus: Arc::clone(&event_bus),
    }))
    .unwrap();

  state.0.lock().unwrap().initialized = true;
}

#[tokio::main]
async fn main() {
  let tray_menu = SystemTrayMenu::new().add_item(CustomMenuItem::new("quit", "Quit"));

  tauri::Builder::default()
    .manage(AppState(Mutex::new(InnerAppState { initialized: false })))
    .system_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(|_, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => handle_menu_item_click(id),
      _ => {},
    })
    .setup(|app| {
      if let Some(window) = app.get_window("main") {
        utils::window::apply_window_blur(&window);
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![app_ready])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
