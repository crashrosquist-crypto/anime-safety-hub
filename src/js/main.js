import '../css/style.css';
import { getTrendingAnime } from '../js/animeApi.js';

// Function to load HTML partials.
async function loadPartial(containerId, filePath) {
  try {
    const response = await fetch(filePath);
    const html = await response.text();
    document.querySelector(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Failed to load partial from ${filePath};`, error);
  }
}

// Init
async function init() {
  await loadPartial('#header-container', '/partials/header.html');
  await loadPartial('#footer-container', '/partials/footer.html');

  const animeList = await getTrendingAnime();
  const gridContainer = document.querySelector('#app-container');

  gridContainer.innerHTML = '';

  animeList.forEach(anime => {
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

init();