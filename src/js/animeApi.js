export async function getTrendingAnime() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Failed to fetch trending animeL", error);
        return[];
    }
}