import { defineConfig } from 'vitest/config';
import path from 'node:path';
import fs from 'node:fs';

// Carga .env.test (claves del stack local) para las pruebas de RLS.
const envFile = path.resolve(__dirname, '.env.test');
const testEnv: Record<string, string> = {};
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) testEnv[m[1]] = m[2];
  }
}

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    globals: true, // habilita el auto-cleanup de Testing Library
    environment: 'node',
    exclude: ['**/node_modules/**', '**/.claude/**', 'tests/e2e/**'], // e2e es de Playwright
    env: testEnv,
    // tests/unit usa jsdom por archivo con // @vitest-environment jsdom
  },
});
