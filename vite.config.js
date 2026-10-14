import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        animeDetails: resolve(__dirname, 'animeDetails.html'),
        'watchlist': resolve(__dirname, 'watchlist.html')
      },
    },
  },
});