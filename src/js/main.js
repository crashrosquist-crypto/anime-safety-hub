// src/main.js
import '../css/style.css';
import { getTrendingAnime } from './animeApi.js';
import { initLayout } from './util.js';

async function init() {
  // Load header and footer using your util function
  await initLayout();

  const animeList = await getTrendingAnime();
  
  if (animeList && animeList.length > 0) {
    const topAnime = animeList[0]; // Grab the #1 show
    
    // --- POPULATE DYNAMIC HERO BANNER ---
    const heroBanner = document.querySelector('#hero-banner');
    const heroTitle = document.querySelector('#hero-title');
    const heroSynopsis = document.querySelector('#hero-synopsis');
    const heroLink = document.querySelector('#hero-link');

    const heroImage = topAnime.images?.jpg?.large_image_url || topAnime.images?.jpg?.image_url;
    
    if (heroBanner && heroImage) {
      heroBanner.style.setProperty('--hero-bg', `url('${heroImage}')`);
    }

    if (heroTitle) heroTitle.textContent = topAnime.title;
    if (heroSynopsis) heroSynopsis.textContent = topAnime.synopsis ? topAnime.synopsis.substring(0, 150) + '...' : 'Check safety ratings and community insights for this top trending show.';
    if (heroLink) heroLink.href = `./animeDetails.html?id=${topAnime.mal_id}`;
  }

  const gridContainer = document.querySelector('#app-container');
  if (gridContainer) {
    gridContainer.innerHTML = '';

    const displayCards = animeList.slice(1);

    displayCards.forEach(anime => {
      const card = document.createElement('div');
      card.classList.add('anime-card');
      card.innerHTML = `
        <a href="./animeDetails.html?id=${anime.mal_id}">
          <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
          <h3>${anime.title}</h3>
        </a>
        <p>Score: ${anime.score ?? 'N/A'}</p>
      `;
      gridContainer.appendChild(card);
    });
  }
}

init();