import { mockAnimeList } from './mockData.js';

export async function getTrendingAnime() {
  try {
    // Try hitting the live Jikan endpoint with a tight timeout or normal fetch
    const response = await fetch('https://api.tenrai.org/v1/top/anime?filter=bypopularity&rating=pg13');
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    return data.data;
    
  } catch (error) {
    console.warn("⚠️ Jikan API is down. Switching to local mock data for development.", error);
    // Return your local array so you can keep working on UI/UX seamlessly!
    return mockAnimeList;
  }
}