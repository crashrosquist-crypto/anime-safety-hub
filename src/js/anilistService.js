export async function fetchAniListGenres(animeTitle) {
    const query = `
        query ($search: String) {
            Media (search: $search, type: ANIME) {
                genres
            }
        }
    `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: { search: animeTitle }
            })
        });

        const json = await response.json();
        return json?.data?.Media?.genres || [];
    } catch (error) {
        console.warn("AniList fetch failed:", error);
        return [];
    }
}