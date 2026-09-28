import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';
import dotenv from 'dotenv';

import { execSync } from 'child_process';

dotenv.config();

let gitCommitHash = 'unknown';
try {
  gitCommitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch {}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          define: {
            'process.env.GDRIVE_CLIENT_ID': JSON.stringify(
              process.env.GDRIVE_CLIENT_ID || '74155265273-kuhjen26hso406vpvaljoe5lvhl4h4tt.apps.googleusercontent.com'
            ),
            'process.env.GDRIVE_CLIENT_SECRET': JSON.stringify(process.env.GDRIVE_CLIENT_SECRET || ''),
            'process.env.GIT_COMMIT_HASH': JSON.stringify(gitCommitHash),
          },
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['better-sqlite3', 'sharp', 'electron'],
            },
          },
        },
      },
      {
        entry: 'src/preload/main.preload.ts',
        onstart(args) {
          args.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs',
                entryFileNames: 'main.preload.js',
              },
            },
          },
        },
      },
      {
        entry: 'src/preload/picker.preload.ts',
        onstart(args) {
          args.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs',
                entryFileNames: 'picker.preload.js',
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  build: {
    rollupOptions: {
      input: {
        manager: path.resolve(import.meta.dirname, 'src/renderer/manager/index.html'),
        picker: path.resolve(import.meta.dirname, 'src/renderer/picker/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
