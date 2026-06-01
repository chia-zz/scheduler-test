import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' makes asset paths relative, so it works on GitHub Pages
// regardless of repository name (e.g. https://user.github.io/repo/).
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/scheduler-test/' : '/',
});
