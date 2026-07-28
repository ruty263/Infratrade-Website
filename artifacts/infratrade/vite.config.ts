import path from 'path';
import { defineConfig } from 'vite';

// PORT is required for dev/preview server but not for static builds.
const rawPort = process.env.PORT;
const isBuild = process.argv.includes('build');

if (!isBuild) {
  if (!rawPort) {
    throw new Error('PORT environment variable is required but was not provided.');
  }
  const _check = Number(rawPort);
  if (Number.isNaN(_check) || _check <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
}

const port = Number(rawPort ?? 3000);
const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  root: path.resolve(import.meta.dirname),
  publicDir: 'public',
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        category: path.resolve(import.meta.dirname, 'category.html'),
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
