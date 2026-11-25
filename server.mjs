import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distDir = path.resolve(__dirname, 'dist');
const port = Number(process.env.PORT) || 3000;

if (!fs.existsSync(distDir)) {
  console.error('Build directory "dist" not found. Run "npm run build" or "yarn build" first.');
  process.exit(1);
}

app.use(express.static(distDir, { maxAge: '1h' }));

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Maison Solène server listening on http://0.0.0.0:${port}`);
});
