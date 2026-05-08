async function loadOptions(){
    const data = await chrome.storage.local.get("checked");
    return Boolean(data.checked);
}

function getKeyMaterial(username, tokenBytes) {
    const enc = new TextEncoder();
    const tokenHex = Array.from(tokenBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const combined = `${username}:${tokenHex}`;

    return window.crypto.subtle.importKey(
        "raw",
        enc.encode(combined),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
}

// Derive key from salt and keyMaterial
function getKey(keyMaterial, saltBytes) {
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Decrypt password
async function decrypt(credObj) {
    const keyMaterial = await getKeyMaterial(credObj.username, credObj.token);
    const key = await getKey(keyMaterial, credObj.salt);
    const encryptedBytes = new Uint8Array(credObj.password);

    if (!key) {
        return;
    }

    let decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: credObj.iv,
        },
        key,
        encryptedBytes.buffer,
    );
    const dec = new TextDecoder();
    return dec.decode(decrypted);
};


function checkLoginStatus() {
    // Check if the user is already logged in by looking for common elements that only appear when logged in
    const isLoggedIn =
        document.querySelector('#login-btn') === null || document.querySelector('.form-element form-button') === null; // Check if login button exists

    if (!isLoggedIn) {
        return;
    }

    // Look for a login form in the navigation bar
    loginViaNavbar();
}

function loginViaNavbar() {

    // Get stored credentials and things to derive encryption key
    chrome.storage.local.get(['username', 'password', 'token', 'salt', 'iv'], function (credentials) {
        if (!credentials.username || !credentials.password) {
            return;
        } else {
            credentials.token = new Uint8Array(credentials.token);
            credentials.salt = new Uint8Array(credentials.salt);
            credentials.iv = new Uint8Array(credentials.iv);
        }

        // Function to find and interact with the login form
        const findAndSubmitLoginForm = () => {

            // Try to find username/email and password fields anywhere on the page
            const usernameField = document.querySelector("#username") || document.querySelector('#credential_0');
            const passwordField = document.querySelector("#password") || document.querySelector('#credential_1');
            console.log(usernameField);
            console.log(passwordField);

            // Try to find a submit button first
            const submitButton = document.querySelector('.form-element.form-button') || document.querySelector('#login-btn');
            console.log(submitButton);
            // If we found username and password fields
            if (usernameField && passwordField) {

                // Fill in the fields
                decrypt(credentials)
                .then(plaintext => {
                  
                      usernameField.value = credentials.username;
                      passwordField.value = plaintext;
                        // Dispatch input events to trigger any listeners
                        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                        usernameField.dispatchEvent(new Event('change', { bubbles: true }));
                        passwordField.dispatchEvent(new Event('change', { bubbles: true }));

                        // Small delay before submission
                        if (submitButton) {
                            submitButton.click();
                        };
                    });
            }
        };

        findAndSubmitLoginForm();
    });
}

loadOptions().then((turnedOn) =>{
    if(turnedOn){
        // Wait for the DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkLoginStatus);
        } else {
            // DOM is already ready
            checkLoginStatus();
        }
    }
})

