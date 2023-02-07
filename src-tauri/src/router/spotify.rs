use super::RouterBuilder;

use windows::Win32::Foundation::HWND;
use windows::Win32::UI::Shell::ShellExecuteW;
use windows::Win32::UI::WindowsAndMessaging::SW_SHOW;
use windows::core::{PCWSTR, HSTRING};
use windows::w;

pub(crate) fn spotify_router() -> RouterBuilder {
  <RouterBuilder>::new()
		.mutation("invokeUri", |t| {
      t(|_ctx, uri: String| {
				if !uri.starts_with("spotify:") {
					return;
				}

        unsafe {
					ShellExecuteW(
						HWND(0),
						w!("open"),
						&HSTRING::from(uri),
						PCWSTR::null(),
						PCWSTR::null(),
						SW_SHOW
					);
				}
      })
    })
}