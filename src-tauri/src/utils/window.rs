use tauri::Window;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
#[cfg(target_os = "windows")]
use window_vibrancy::apply_blur;

pub fn apply_window_blur(window: &Window) {
	#[cfg(target_os = "macos")]
	apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
		.expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

	#[cfg(target_os = "windows")]
	apply_blur(&window, None)
		.expect("Unsupported platform! 'apply_blur' is only supported on Windows");
}