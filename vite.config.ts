import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so dist/ also works from a subfolder (e.g. Live Server at /dist/index.html).
export default defineConfig({ base: './', plugins: [react()] });
