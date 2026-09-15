use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::time::Duration;

const GITHUB_CLIENT_ID: &str = env!("GITHUB_CLIENT_ID");
const GITHUB_SCOPE: &str = "repo read:user";
const KEYRING_SERVICE: &str = "git-sushi";
const KEYRING_ACCOUNT: &str = "github-token";

#[derive(Serialize, Deserialize, Clone)]
pub struct DeviceCode {
    device_code: String,
    user_code: String,
    verification_uri: String,
    expires_in: u64,
    interval: u64,
}

#[derive(Deserialize)]
struct AccessTokenPayload {
    access_token: Option<String>,
    error: Option<String>,
}

#[derive(Deserialize)]
struct GithubErrorResponse {
    error: String,
    error_description: Option<String>,
}

fn keyring_entry() -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn github_start_device_flow() -> Result<DeviceCode, String> {
    let client = reqwest::Client::new();
    let response = client
        .post("https://github.com/login/device/code")
        .header("Accept", "application/json")
        .form(&[("client_id", GITHUB_CLIENT_ID), ("scope", GITHUB_SCOPE)])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        let error = response
            .json::<GithubErrorResponse>()
            .await
            .map_err(|e| e.to_string())?;
        return Err(error.error_description.unwrap_or(error.error));
    }

    response.json::<DeviceCode>().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn github_poll_device_flow(device_code: String, interval: u64) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut wait_seconds = interval;

    loop {
        tokio::time::sleep(Duration::from_secs(wait_seconds)).await;

        let response = client
            .post("https://github.com/login/oauth/access_token")
            .header("Accept", "application/json")
            .form(&[
                ("client_id", GITHUB_CLIENT_ID),
                ("device_code", device_code.as_str()),
                ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
            ])
            .send()
            .await
            .map_err(|e| e.to_string())?
            .json::<AccessTokenPayload>()
            .await
            .map_err(|e| e.to_string())?;

        if let Some(token) = response.access_token {
            keyring_entry()?.set_password(&token).map_err(|e| e.to_string())?;
            return Ok(token);
        }

        match response.error.as_deref() {
            Some("authorization_pending") => continue,
            Some("slow_down") => {
                wait_seconds += 5;
                continue;
            }
            Some(other) => return Err(other.to_string()),
            None => return Err("unknown_error".into()),
        }
    }
}

#[tauri::command]
pub fn github_stored_token() -> Option<String> {
    keyring_entry().ok()?.get_password().ok()
}

#[tauri::command]
pub fn github_logout() -> Result<(), String> {
    match keyring_entry()?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
