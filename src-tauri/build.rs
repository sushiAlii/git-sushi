fn main() {
    dotenvy::dotenv().ok();
    println!(
        "cargo:rustc-env=GITHUB_CLIENT_ID={}",
        std::env::var("GITHUB_CLIENT_ID").expect("GITHUB_CLIENT_ID must be set in src-tauri/.env")
    );
    tauri_build::build()
}
