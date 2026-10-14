import '../css/style.css';
import { initLayout } from './util.js';
import { isParentLoggedIn } from './parentAuth.js';

const STORAGE_KEY = 'anime_watchlist';
const PIN_KEY = 'parent_custom_pin';
const AUTH_KEY = 'parentAuth';

async function initParentHub() {
  await initLayout();

  const mainContent = document.querySelector('#parent-main-content');
  if (!mainContent) return;

  if (!isParentLoggedIn()) {
    renderAuthForm(mainContent);
  } else {
    renderDashboard(mainContent);
  }
}

function renderAuthForm(container) {
  const hasPin = localStorage.getItem(PIN_KEY);

  container.innerHTML = `
    <div style="max-width: 450px; margin: 40px auto; background: var(--card-bg, #fff); padding: 30px; border-radius: 12px; border: 1px solid var(--border-color, #ddd); box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center;">
      <h2>🔒 Parent Access Required</h2>
      <p style="color: #666; margin-bottom: 20px;">
        ${hasPin ? 'Please enter your Parent PIN to access the dashboard.' : 'Welcome! Set up a 4+ digit Parent PIN to begin.'}
      </p>
      
      <form id="parent-auth-form" style="display: flex; flex-direction: column; gap: 15px;">
        <input type="password" id="pin-input" placeholder="${hasPin ? 'Enter PIN' : 'Create New PIN'}" required style="padding: 12px; font-size: 1rem; border: 1px solid #ccc; border-radius: 6px; text-align: center;" />
        <button type="submit" style="padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          ${hasPin ? 'Login to Dashboard' : 'Set PIN & Sign Up'}
        </button>
      </form>
    </div>
  `;

  const form = container.querySelector('#parent-auth-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputVal = container.querySelector('#pin-input').value.trim();

    if (!hasPin) {
      if (inputVal.length >= 4) {
        localStorage.setItem(PIN_KEY, inputVal);
        localStorage.setItem(AUTH_KEY, 'true');
        alert('Parent PIN created and logged in successfully!');
        initParentHub();
      } else {
        alert('PIN must be at least 4 digits.');
      }
    } else {
      const savedPin = localStorage.getItem(PIN_KEY) || '1234';
      if (inputVal === savedPin) {
        localStorage.setItem(AUTH_KEY, 'true');
        initParentHub();
      } else {
        alert('Incorrect PIN. (Default is 1234 if unset)');
      }
    }
  });
}

function renderDashboard(container) {
  container.innerHTML = `
    <h2>Parent Control Dashboard</h2>
    <p class="section-hint">Monitor saved shows and manage safety settings.</p>
    
    <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
      <button id="logout-btn" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
        🔒 Logout of Parent Mode
      </button>
    </div>

    <section class="parent-controls" style="background: var(--card-bg); padding: 20px; border-radius: 10px; margin-bottom: 30px; border: 1px solid var(--border-color);">
      <h3>Content Restrictions</h3>
      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-top: 10px;">
        <input type="checkbox" id="mature-filter-toggle" style="width: 18px; height: 18px;">
        <span>Hide Mature / R-Rated Content from App</span>
      </label>
    </section>

    <h3>Monitored Watchlist</h3>
    <div id="parent-watchlist-grid" class="anime-grid"></div>
  `;

  // Logout handler
  container.querySelector('#logout-btn').addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    initParentHub();
  });

  // Watchlist rendering logic
  const watchlistContainer = container.querySelector('#parent-watchlist-grid');
  const savedWatchlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (savedWatchlist.length === 0) {
    watchlistContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #666; padding: 40px;">No shows currently bookmarked by the user.</p>`;
    return;
  }

  watchlistContainer.innerHTML = savedWatchlist.map(anime => `
    <div class="anime-card">
      <img src="${anime.image}" alt="${anime.title}" />
      <h3>${anime.title}</h3>
      <button class="parent-remove-btn" data-id="${anime.mal_id}" style="margin: 10px; padding: 6px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Remove Show
      </button>
    </div>
  `).join('');

  // Remove buttons inside dashboard
  watchlistContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('parent-remove-btn')) {
      const idToRemove = e.target.getAttribute('data-id');
      let list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      list = list.filter(item => String(item.mal_id) !== String(idToRemove));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      renderDashboard(container);
    }
  });
}

initParentHub();