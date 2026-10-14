import '../css/style.css';
import { mockAnimeList } from './mockData.js';
import { fetchAniListGenres } from './anilistService.js';
import { fetchAnimeReviews, extractParentWarnings } from './reviewService.js';
import { isParentLoggedIn } from './parentAuth.js';
import { isInWatchlist, toggleWatchlist } from './watchlist.js';
import { initComments } from './comments.js';

// --- Load HTML Partials (Header & Footer) ---
async function loadPartial(containerId, filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to load ${filePath}`);
    const html = await response.text();
    document.querySelector(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Failed to load partial from ${filePath}:`, error);
  }
}

// 1. Fetch your episode intensity levels from the custom JSON file
async function fetchEpisodeData(animeId) {
    try {
        const response = await fetch('/jsons/episodes.json');
        const data = await response.json();
        return data[animeId] || [];
    } catch (error) {
        console.warn("Could not load episode dataset:", error);
        return [];
    }
}

async function fetchAnimeDetail() {
    // Load navigation header and footer partials first
    await loadPartial('#header-container', '/partials/header.html');
    await loadPartial('#footer-container', '/partials/footer.html');

    const params = new URLSearchParams(window.location.search);
    const animeId = parseInt(params.get('id'));
    const container = document.querySelector('#detail-container');

    if (!animeId) {
        container.innerHTML = '<p>No anime selected.</p>';
        return;
    }

    let anime = null;

    try {
        const response = await fetch(`https://api.tenrai.org/v1/anime/${animeId}`);
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        anime = data.data;
    } catch (error) {
        console.warn("⚠️ API failed. Pulling details from mock data.", error);
        anime = mockAnimeList.find(a => a.mal_id === animeId);
    }

    if (!anime) {
        container.innerHTML = '<p>Anime details could not be found.</p>';
        return;
    }

    // --- FETCH SECONDARY DATA (AniList Genres) ---
    const anilistGenres = await fetchAniListGenres(anime.title);
    const genrePills = anilistGenres.length > 0 
        ? anilistGenres.map(g => `<span class="tag-pill">${g}</span>`).join(' ')
        : '<em>No secondary genres found.</em>';

    // --- FETCH REVIEWS & SCAN FOR KEYWORDS ---
    const reviews = await fetchAnimeReviews(animeId);
    const flaggedKeywords = extractParentWarnings(reviews);
    
    const warningPills = flaggedKeywords.length > 0
        ? flaggedKeywords.map(word => `<span class="warning-pill">⚠️ ${word}</span>`).join(' ')
        : '<p class="empty-notice">No major content triggers flagged in community reviews.</p>';

    // --- FETCH EPISODE BREAKDOWN FROM JSON ---
    const customEpisodes = await fetchEpisodeData(animeId);
    let episodeHtml = '';

    if (customEpisodes.length > 0) {
        const episodeBars = customEpisodes.map(item => {
            let colorClass = 'ep-green';
            if (item.status === 'caution') colorClass = 'ep-yellow';
            if (item.status === 'danger') colorClass = 'ep-red';

            return `<div class="ep-bar ${colorClass}" title="${item.label}">E${item.ep}</div>`;
        }).join('');

        episodeHtml = `
            <div class="episode-breakdown-section">
              <h4>📊 Episode-by-Episode Safety Timeline</h4>
              <p class="section-hint">Hover over blocks to check content thresholds:</p>
              <div class="ep-grid">
                ${episodeBars}
              </div>
            </div>
        `;
    }

    const inList = isInWatchlist(anime.mal_id);
    
    // Watchlist Button HTML
    const watchlistButtonHtml = `
        <button id="watchlist-btn" class="btn-watchlist ${inList ? 'in-watchlist' : ''}">
            ${inList ? '❌ Remove from Watchlist' : '⭐ Add to Watchlist'}
        </button>
    `;

    // --- SAFETY RATING LOGIC ---
    const ratingString = anime.rating || "Unrated";
    let safetyBadgeClass = "safe-general";
    let safetyText = "General Audience";

    if (ratingString.includes("R") || ratingString.includes("Rx")) {
        safetyBadgeClass = "safe-mature";
        safetyText = "Mature / Adult Themes";
    } else if (ratingString.includes("PG-13") || ratingString.includes("PG")) {
        safetyBadgeClass = "safe-caution";
        safetyText = "Parental Guidance Advised";
    }

    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    const isRedZone = ratingString.includes("R") || ratingString.includes("Rx");

    // --- RED ZONE BLUR IMAGE HTML ---
    const imageHtml = `
        <div class="media-container ${isRedZone ? 'red-zone-media' : ''}">
            <img src="${imageUrl}" alt="${anime.title}" title="Hover to reveal image" />
            ${isRedZone ? `
                <div class="red-zone-badge">
                    ⚠️ Red Zone (Hover to View)
                </div>
            ` : ''}
        </div>
    `;

    // --- RENDER TO DOM ---
    container.innerHTML = `
      <div class="anime-detail-view">
        ${imageHtml}
        <div class="anime-info">
          <h2>${anime.title}</h2>
          <p><strong>Score:</strong> ${anime.score ?? 'N/A'}</p>
          <p><strong>Official Rating:</strong> ${ratingString}</p>
          
          <div class="safety-panel ${safetyBadgeClass}">
            <h4>🛡️ Content Safety Assessment</h4>
            <p><strong>Status:</strong> ${safetyText}</p>
          </div>

          ${watchlistButtonHtml}

          ${episodeHtml}

          <div class="review-warnings-section">
            <h4>🔍 Community Review Content Flags</h4>
            <p class="section-hint">Automatically scanned from viewer reviews:</p>
            <div class="pills-flex-wrap">
              ${warningPills}
            </div>
          </div>

          <div class="anilist-tags-section">
            <h4>🏷️ AniList Genres</h4>
            <div class="pills-flex-wrap">
              ${genrePills}
            </div>
          </div>

          <p><strong>Synopsis:</strong> ${anime.synopsis}</p>
          <br>

          <!-- Parent Reviews & Comments Section -->
          <section class="comments-section">
            <h3>💬 Parent Community Reviews</h3>
            
            <form id="comment-form" class="comment-form">
              <textarea id="comment-input" placeholder="Share your thoughts on content appropriateness for kids..." rows="3" required></textarea>
              <div class="comment-form-footer">
                <select id="rating-input">
                  <option value="5">⭐⭐⭐⭐⭐ (5/5 Safe & Great)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5 Minor warnings)</option>
                  <option value="3">⭐⭐⭐ (3/5 Parental guidance)</option>
                  <option value="2">⭐⭐ (2/5 Caution)</option>
                  <option value="1">⭐ (1/5 Not recommended)</option>
                </select>
                <button type="submit" class="btn-primary">Post Review</button>
              </div>
            </form>

            <div id="comments-list" class="comments-list">
              <!-- Dynamic reviews load here -->
            </div>
          </section>

          <br>
          <a href="/" class="back-btn">⬅ Back to Home</a>
        </div>
      </div>
    `;

    const watchlistBtn = container.querySelector('#watchlist-btn');
    if (watchlistBtn) {
        watchlistBtn.addEventListener('click', () => {
            const added = toggleWatchlist(anime);
            watchlistBtn.classList.toggle('in-watchlist', added);
            watchlistBtn.textContent = added ? '❌ Remove from Watchlist' : '⭐ Add to Watchlist';
        });
    }

    // Initialize comments module for this specific show ID
    initComments(anime.mal_id);
}

fetchAnimeDetail();