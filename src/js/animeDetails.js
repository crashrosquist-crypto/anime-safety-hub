import '../css/style.css';
import { mockAnimeList } from './mockData.js';
import { fetchAniListGenres } from './anilistService.js';
import { fetchAnimeReviews, extractParentWarnings } from './reviewService.js';
import { isParentLoggedIn } from './parentAuth.js';
import { isInWatchlist, toggleWatchlist } from './watchlist.js';

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
        : '<p style="font-size: 0.85rem; color: #666;">No major content triggers flagged in community reviews.</p>';

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
            <div class="episode-breakdown-section" style="margin: 20px 0;">
              <h4>📊 Episode-by-Episode Safety Timeline</h4>
              <p style="font-size: 0.85rem; color: #555;">Hover over blocks to check content thresholds:</p>
              <div class="ep-grid" style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px;">
                ${episodeBars}
              </div>
            </div>
        `;
    }

    const inList = isInWatchlist(anime.mal_id);
    
    // Watchlist Button HTML
    const watchlistButtonHtml = `
        <button id="watchlist-btn" style="margin: 15px 0; padding: 10px 16px; background: ${inList ? '#dc3545' : '#28a745'}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
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
        <div style="position: relative; display: inline-block;">
            <img src="${imageUrl}" alt="${anime.title}" style="border-radius: 8px; filter: ${isRedZone ? 'blur(12px)' : 'none'}; transition: filter 0.3s ease; cursor: pointer;" title="Hover to reveal image" onmouseover="this.style.filter='blur(0)'" onmouseout="this.style.filter='${isRedZone ? 'blur(12px)' : 'none'}'" />
            ${isRedZone ? `
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(220, 53, 69, 0.9); color: white; padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; pointer-events: none; z-index: 10;">
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
          
          <div class="safety-panel ${safetyBadgeClass}" style="margin: 15px 0; padding: 12px; border-radius: 6px; border: 1px solid #ccc;">
            <h4 style="margin: 0 0 5px 0;">🛡️ Content Safety Assessment</h4>
            <p style="margin: 0;"><strong>Status:</strong> ${safetyText}</p>
          </div>

          ${watchlistButtonHtml}

          <!-- Renders the episode timeline fetched from JSON -->
          ${episodeHtml}

          <!-- Automated Review Warning Scanner Section -->
          <div class="review-warnings-section" style="margin: 20px 0; padding: 12px; background: #fff8f8; border: 1px solid #f5c6cb; border-radius: 6px;">
            <h4 style="margin: 0 0 5px 0; color: #721c24;">🔍 Community Review Content Flags</h4>
            <p style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">Automatically scanned from viewer reviews:</p>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${warningPills}
            </div>
          </div>

          <div class="anilist-tags-section" style="margin: 15px 0;">
            <h4 style="margin: 0 0 5px 0;">🏷️ AniList Genres</h4>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${genrePills}
            </div>
          </div>

          <p><strong>Synopsis:</strong> ${anime.synopsis}</p>
          <br>
          <a href="/" class="back-btn">⬅ Back to Home</a>
        </div>
      </div>
    `;

    const watchlistBtn = container.querySelector('#watchlist-btn');
    if (watchlistBtn) {
        watchlistBtn.addEventListener('click', () => {
            const added = toggleWatchlist(anime);
            watchlistBtn.style.background = added ? '#dc3545' : '#28a745';
            watchlistBtn.textContent = added ? '❌ Remove from Watchlist' : '⭐ Add to Watchlist';
        });
    }
}

fetchAnimeDetail();