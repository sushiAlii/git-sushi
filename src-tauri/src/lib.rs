mod github_auth;

use github_auth::{github_logout, github_poll_device_flow, github_start_device_flow, github_stored_token};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            github_start_device_flow,
            github_poll_device_flow,
            github_stored_token,
            github_logout
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
