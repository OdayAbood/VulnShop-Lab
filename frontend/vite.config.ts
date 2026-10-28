import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to localhost only: this app must never be reachable from the network.
    host: '127.0.0.1',
    port: 5173,
    // Fail instead of silently switching to another port.
    strictPort: true,
  },
  test: {
    // Simulated browser DOM so React components can render in tests.
    environment: 'jsdom',
  },
})
