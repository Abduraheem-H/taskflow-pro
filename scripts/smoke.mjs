import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distIndex = path.join(root, 'dist', 'index.html');
const assetsDir = path.join(root, 'dist', 'assets');
const clientService = fs.readFileSync(path.join(root, 'src', 'services', 'gemini.ts'), 'utf8');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(fs.existsSync(distIndex), 'dist/index.html is missing. Run npm run build first.');
assert(fs.existsSync(assetsDir), 'dist/assets is missing. Run npm run build first.');

const assets = fs.readdirSync(assetsDir);
assert(assets.some((file) => file.endsWith('.js')), 'No JavaScript asset found in dist/assets.');
assert(assets.some((file) => file.endsWith('.css')), 'No CSS asset found in dist/assets.');
assert(clientService.includes("fetch('/api/chat'"), 'Client assistant service must call /api/chat.');
assert(!clientService.includes('@google/genai'), 'Client assistant service must not import @google/genai.');
assert(!clientService.includes('GEMINI_API_KEY'), 'Client assistant service must not reference GEMINI_API_KEY.');

console.log('Smoke checks passed.');
