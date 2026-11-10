import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const currentDir = import.meta.dirname || process.cwd();
  const env = loadEnv(mode, path.resolve(currentDir, '..'), 'VITE_');
  const port = Number(env.VITE_PORT) || 5173;

  return {
    plugins: [react()],
    envDir: path.resolve(currentDir, '..'),
    server: {
      port
    }
  };
});
