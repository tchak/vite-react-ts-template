import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import legacy from '@vitejs/plugin-legacy';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  build: {
    manifest: true,
  },
  plugins: [
    reactRefresh(),
    imagetools(),
    legacy({ targets: ['defaults', 'not IE 11'] }),
  ],
});
