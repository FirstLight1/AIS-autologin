# AiS Auto-Login Extension

A secure Chrome extension that auto-fills and submits the login form on STU Bratislava portals (`idp.stuba.sk` and `is.stuba.sk/auth/`), with AES-256 encrypted credential storage.

If you like this extension you can support me here: https://ko-fi.com/firstlight

## Features
- AES-GCM encryption for stored passwords
- Automatic login on `idp.stuba.sk` and `is.stuba.sk/auth/`
- Toggle on/off from the popup
- Open source and privacy-focused — no telemetry, no external requests

## Installation
1. Download this repository (or clone it).
2. Open `chrome://extensions/` and enable **Developer mode**.
3. Click **Load unpacked** and select the project folder.
4. Open the extension popup, enter your AiS username and password, and click **Save Credentials**.
5. Visit `is.stuba.sk/auth/` — the extension will fill in the form and submit it.

## How it works
- `content.js` runs on the matched STU login pages, locates the username/password fields and submit button, decrypts the saved password, and submits the form.
- `popup.js` handles credential entry, encryption, and the on/off toggle.
- `background.js` initializes the extension state (auto-login enabled by default).

## Security
- Uses the Web Crypto API (`AES-GCM` + `PBKDF2`, 100,000 iterations, SHA-256).
- A random 32-byte token, 16-byte salt, and 12-byte IV are generated locally on first save and stored in `chrome.storage.local`.
- Credentials never leave your browser — no server, no analytics, no tracking.

## Permissions
- `storage` — to persist encrypted credentials and settings locally.
- `activeTab` — to reload the active tab when toggling auto-login.
- Host access limited to `*://idp.stuba.sk/*` and `*://is.stuba.sk/auth/`.

## Development
1. Clone the repository.
2. Load the unpacked extension at `chrome://extensions/`.
3. Test on `https://is.stuba.sk/auth/` or `https://idp.stuba.sk/`.

## Roadmap
- Firefox compatibility (port `chrome.*` calls to the WebExtensions `browser.*` API).

## License
MIT License — see `docs/LICESE.md`.

## Contributing
Pull requests welcome!
