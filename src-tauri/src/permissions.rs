#[cfg(target_os = "android")]
const PLUGIN_IDENTIFIER: &str = "dev.skeen";

pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("permissions")
        .setup(|_app, api| {
            #[cfg(target_os = "android")]
            api.register_android_plugin(PLUGIN_IDENTIFIER, "PermissionPlugin")?;
            Ok(())
        })
        .build()
}
