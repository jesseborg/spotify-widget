#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::sync::Arc;

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tokio::sync::broadcast;

mod media;
use crate::media::lib::MediaEvent;
use crate::media::manager::MediaManager;

mod router;
use router::Ctx;

mod utils;

#[tokio::main]
async fn main() {
  let tray_menu = SystemTrayMenu::new()
		.add_item(CustomMenuItem::new("quit", "Quit"));
	
	let router = router::new();
  let event_bus = Arc::new(broadcast::channel::<MediaEvent>(1024));
	
  let manager = MediaManager::new(event_bus.clone())
    .unwrap()
    .build()
    .arced();

  tauri::Builder::default()
		.plugin(rspc::integrations::tauri::plugin(router, move || Ctx {
      manager: Arc::clone(&manager),
      event_bus: Arc::clone(&event_bus),
    }))
    .system_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event(|_, event| if let SystemTrayEvent::MenuItemClick { id, .. } = event {
			match id.as_str() {
				"quit" => std::process::exit(0),
				"about" => todo!(),
				_ => {}
			}
    })
    .setup(|app| {
      if let Some(window) = app.get_window("main") {
        utils::window::apply_window_blur(&window);
				window.show().unwrap();
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
