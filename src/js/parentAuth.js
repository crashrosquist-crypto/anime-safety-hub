export function isParentLoggedIn() {
    const authState = localStorage.getItem('parentAuth');
    return authState === 'true';
}

export function loginParent() {
    localStorage.setItem('parentAuth', 'true');
    window.dispatchEvent(new Event('authChange'));
}

export function logoutParent() {
    localStorage.removeItem('parentAuth');
    window.dispatchEvent(new Event ('authChange'));
}

export function renderAuthButton(containerSelector) {
   const container = document.querySelector(containerSelector);
    if (!container) return;

    const loggedIn = isParentLoggedIn();

    container.innerHTML = `
        <button id="auth-toggle-btn" style="padding: 6px 12px; background: ${loggedIn ? '#dc3545' : '#28a745'}; color: white; border: none; border-radius: 4px; cursor: pointer;">
            ${loggedIn ? '🔒 Parent Mode: ON (Logout)' : '🔓 Parent Mode: OFF (Login)'}
        </button>
    `;

    const btn = container.querySelector('#auth-toggle-btn');
    btn.addEventListener('click', () => {
        if (isParentLoggedIn()) {
            logoutParent();
        } else {
            // Simple prompt for a demo PIN (e.g., "1234")
            const pin = prompt("Enter Parent PIN (try 1234):");
            if (pin === "1234") {
                loginParent();
                alert("Parent mode unlocked!");
            } else if (pin !== null) {
                alert("Incorrect PIN.");
            }
        }
        renderAuthButton(containerSelector); // Re-render button state
    }); 
}