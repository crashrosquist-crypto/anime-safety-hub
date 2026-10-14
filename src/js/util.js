// src/util.js (Add this inside your initLayout function)

export async function loadPartial(selector, filePath) {
  const container = document.querySelector(selector);
  if (!container) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to load ${filePath}`);
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.warn(`Could not load partial from ${filePath}:`, error);
  }
}

export async function initLayout() {
  await loadPartial('#header-container', '/partials/header.html');
  await loadPartial('#footer-container', '/partials/footer.html');

  // --- MOBILE MENU TOGGLE LOGIC ---
  const menuBtn = document.querySelector('#menu-btn');
  const navLinks = document.querySelector('#nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking any link (optional, nice for UX)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}