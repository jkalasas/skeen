use tauri::{AppHandle, Emitter};

const OAUTH_CALLBACK_PORT: u16 = 9274;
const MOBILE_REDIRECT_URI: &str = "https://jkalasas.github.io/skeen/oauth-callback.html";

const CALLBACK_HTML: &str = r#"<!DOCTYPE html>
<html>
<head>
    <title>Signing In...</title>
    <style>
        body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
        .container { text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #3b82f6; margin-bottom: 0.5rem; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Signing In...</h1>
        <p>Please wait...</p>
    </div>
    <script>
        const hash = window.location.hash.substring(1);
        if (hash) {
            fetch('/token?' + hash, { method: 'POST' })
                .then(() => window.close())
                .catch(() => window.close());
        }
    </script>
</body>
</html>"#;

const SUCCESS_HTML: &str = r#"<!DOCTYPE html>
<html>
<head>
    <title>Sign In Successful</title>
    <style>
        body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
        .container { text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #22c55e; margin-bottom: 0.5rem; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sign In Successful</h1>
        <p>You can close this window and return to the app.</p>
    </div>
    <script>window.close();</script>
</body>
</html>"#;

#[tauri::command]
pub fn get_oauth_redirect_uri() -> String {
    if cfg!(target_os = "android") || cfg!(target_os = "ios") {
        MOBILE_REDIRECT_URI.to_string()
    } else {
        format!("http://127.0.0.1:{}/callback", OAUTH_CALLBACK_PORT)
    }
}

#[tauri::command]
pub fn is_mobile_platform() -> bool {
    cfg!(target_os = "android") || cfg!(target_os = "ios")
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
pub async fn start_oauth_server(app: AppHandle) -> Result<(), String> {
    use std::sync::mpsc;
    use std::thread;
    use tiny_http::{Response, Server};

    let (tx, rx) = mpsc::channel::<()>();

    thread::spawn(move || {
        let addr = format!("127.0.0.1:{}", OAUTH_CALLBACK_PORT);
        let server = match Server::http(&addr) {
            Ok(s) => s,
            Err(e) => {
                let _ = app.emit("oauth-error", format!("Failed to start server: {}", e));
                return;
            }
        };

        for request in server.incoming_requests() {
            let url = request.url().to_string();

            if url.starts_with("/token") {
                let response = Response::from_string(SUCCESS_HTML)
                    .with_header(
                        tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"text/html"[..])
                            .unwrap(),
                    );
                let _ = request.respond(response);

                let _ = app.emit("oauth-callback", url);
                let _ = tx.send(());
                break;
            } else if url.starts_with("/callback") {
                let response = Response::from_string(CALLBACK_HTML)
                    .with_header(
                        tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"text/html"[..])
                            .unwrap(),
                    );
                let _ = request.respond(response);
            }
        }
    });

    let _ = rx.recv();
    Ok(())
}

#[cfg(any(target_os = "android", target_os = "ios"))]
#[tauri::command]
pub async fn start_oauth_server(_app: AppHandle) -> Result<(), String> {
    Ok(())
}
