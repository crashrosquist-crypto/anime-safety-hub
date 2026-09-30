import '../css/style.css';

async function fetchAnimeDetail() {
    const params = new URLSearchParams(window.location.search);
    const animeId = params.get('id');
    const container = document.querySelector('#detail-container');

    if (!animeId) {
        container.innerHTML = '<p>No anime selected.</p>';
        return;
    }

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
        const data = await response.json();
        const anime = data.data;

        container.innerHTML = `
        <div class="anime-detail-view">
        <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" />
        <div class="anime-info">
          <h2>${anime.title}</h2>
          <p><strong>Score:</strong> ${anime.score ?? 'N/A'}</p>
          <p><strong>Rating:</strong> ${anime.rating ?? 'N/A'}</p>
          <p><strong>Synopsis:</strong> ${anime.synopsis}</p>
        </div>
      </div>
      `;
    } catch (error) {
        console.error("Failed to load anime details:", error);
        container.innerHTML = '<p>Error loading show details.</p>';
    }
}

fetchAnimeDetail();