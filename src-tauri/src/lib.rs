mod oauth;

use tauri::Manager;

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  #[cfg(desktop)]
  {
    if let Some(splashscreen) = window.get_webview_window("splashscreen") {
      splashscreen.close().unwrap();
    }
    window.get_webview_window("main").unwrap().show().unwrap();
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_deep_link::init())
    .invoke_handler(tauri::generate_handler![
      oauth::get_oauth_redirect_uri,
      oauth::start_oauth_server,
      oauth::is_mobile_platform,
      close_splashscreen
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
