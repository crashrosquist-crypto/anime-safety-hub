// src/js/reviewService.js

export async function fetchAnimeReviews(animeId) {
    try {
        const response = await fetch(`https://api.tenrai.org/v1/anime/${animeId}/reviews`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.warn("Could not fetch reviews:", error);
        return [];
    }
}

// The keyword scanner function
export function extractParentWarnings(reviewsArray) {
    const triggerWords = [
        'violence', 'gore', 'blood', 'profanity', 'fanservice', 
        'nudity', 'sexual', 'scary', 'mature', 'disturbing', 'ecchi', 
        'pervert', 'suggestive', 'fanservice', 'humor'
    ];
    const foundWarnings = new Set();

    reviewsArray.forEach(review => {
        const text = (review.review || review.content || '').toLowerCase();
        triggerWords.forEach(word => {
            if (text.includes(word)) {
                foundWarnings.add(word);
            }
        });
    });

    return Array.from(foundWarnings);
}