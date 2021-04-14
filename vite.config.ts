import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  build: {
    manifest: true,
  },
  plugins: [reactRefresh(), legacy({ targets: ['defaults', 'not IE 11'] })],
});
