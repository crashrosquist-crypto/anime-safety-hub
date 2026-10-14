// src/js/parentAuth.js

const PIN_KEY = 'parent_custom_pin';
const AUTH_KEY = 'parentAuth';

export function isParentLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === 'true';
}

export function loginParent(enteredPin) {
    const savedPin = localStorage.getItem(PIN_KEY) || '1234'; // Default fallback PIN
    if (enteredPin === savedPin) {
        localStorage.setItem(AUTH_KEY, 'true');
        window.dispatchEvent(new Event('authChange'));
        return true;
    }
    return false;
}

export function setupParentPin(newPin) {
    if (newPin && newPin.length >= 4) {
        localStorage.setItem(PIN_KEY, newPin);
        localStorage.setItem(AUTH_KEY, 'true');
        window.dispatchEvent(new Event('authChange'));
        return true;
    }
    alert("PIN must be at least 4 digits.");
    return false;
}

export function logoutParent() {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event('authChange'));
}

export function renderAuthButton(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const loggedIn = isParentLoggedIn();

    container.innerHTML = `
        <button id="auth-toggle-btn" style="padding: 6px 12px; background: ${loggedIn ? '#dc3545' : '#28a745'}; color: white; border: none; border-radius: 4px; cursor: pointer;">
            ${loggedIn ? '🔒 Parent Mode: ON (Logout)' : '🔓 Parent Login / Setup'}
        </button>
    `;

    const btn = container.querySelector('#auth-toggle-btn');
    btn.addEventListener('click', () => {
        if (isParentLoggedIn()) {
            logoutParent();
            alert("Logged out of Parent Mode.");
        } else {
            const hasPin = localStorage.getItem(PIN_KEY);
            
            if (!hasPin) {
                // First-time "Sign Up / Setup" flow
                const newPin = prompt("Welcome! Set a 4+ digit Parent PIN for future logins:");
                if (newPin) {
                    if (setupParentPin(newPin)) {
                        alert("Parent PIN created and logged in successfully!");
                    }
                }
            } else {
                // Regular "Login" flow
                const pin = prompt("Enter your Parent PIN:");
                if (pin !== null) {
                    if (loginParent(pin)) {
                        alert("Parent mode unlocked!");
                    } else {
                        alert("Incorrect PIN. (Default is 1234 if unset)");
                    }
                }
            }
        }
        renderAuthButton(containerSelector);
    });
}