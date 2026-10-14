// src/watchlist.js
import '../css/style.css';
import { initLayout } from './util.js';

const STORAGE_KEY = 'anime_watchlist';

// --- FUNCTIONS FOR ANIME DETAILS PAGE ---

export function isInWatchlist(malId) {
  const savedWatchlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  return savedWatchlist.some(item => String(item.mal_id) === String(malId));
}

export function toggleWatchlist(anime) {
  let savedWatchlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const exists = savedWatchlist.some(item => String(item.mal_id) === String(anime.mal_id));

  if (exists) {
    savedWatchlist = savedWatchlist.filter(item => String(item.mal_id) !== String(anime.mal_id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedWatchlist));
    return false; // Removed
  } else {
    const watchlistEntry = {
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url || ''
    };
    savedWatchlist.push(watchlistEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedWatchlist));
    return true; // Added
  }
}

// --- WATCHLIST PAGE INITIALIZATION & RENDERING ---

async function initWatchlist() {
  await initLayout();

  const watchlistGrid = document.querySelector('#watchlist-grid');
  if (!watchlistGrid) return; // Exit if we aren't on the watchlist page

  renderWatchlistItems(watchlistGrid);
}

function renderWatchlistItems(container) {
  const savedWatchlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (savedWatchlist.length === 0) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align: center; color: #666; padding: 40px;">
        Your watchlist is empty. Go bookmark some shows from the home page!
      </p>`;
    return;
  }

  container.innerHTML = savedWatchlist.map(anime => `
    <div class="anime-card">
      <a href="./animeDetails.html?id=${anime.mal_id}">
        <img src="${anime.image}" alt="${anime.title}" />
        <h3>${anime.title}</h3>
      </a>
      <button class="remove-watchlist-btn" data-id="${anime.mal_id}" style="margin-top: 10px; width: 100%; padding: 6px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Remove from Watchlist
      </button>
    </div>
  `).join('');
}

// Global click handler to remove items from local storage and update the grid
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-watchlist-btn')) {
    const idToRemove = e.target.getAttribute('data-id');
    const savedWatchlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    const updatedList = savedWatchlist.filter(item => String(item.mal_id) !== String(idToRemove));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    
    const watchlistGrid = document.querySelector('#watchlist-grid');
    if (watchlistGrid) {
      renderWatchlistItems(watchlistGrid);
    }
  }
});

initWatchlist();
initLayout();