const WATCHLIST_KEY = 'kids_watchlist';

export function getWatchList() {
    try {
        const stored = localStorage.getItem(WATCHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error reading watchlist from localStorage:" , error);
        return [];
    }
}

export function isInWatchlist(animeId) {
    const watchlist = getWatchList();
    return watchlist.some(item => item.mal_id === animeId);
}

export function addToWatchlist(anime) {
    const watchlist = getWatchlist();
    if (!isInWatchlist(anime.mal_id)) {
        watchlist.push({
            mal_id: anime.mal_id,
            title: anime.title,
            image_url: anime.images?.jpg?.image_url || '',
            score: anime.score || 'N/A',
            rating: anime.rating || 'Unrated'
        });
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
        return true;
    }
    return false;
}

export function removeFromWatchlist(animeId) {
    let watchlist = getWatchlist();
    watchlist = watchlist.filter(item => item.mal_id !== animeId);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
}


export function toggleWatchlist(anime) {
    if (isInWatchlist(anime.mal_id)) {
        removeFromWatchlist(anime.mal_id);
        return false;
    } else {
        addToWatchlist(anime);
        return true;
    }
}