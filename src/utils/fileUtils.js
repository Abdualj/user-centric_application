import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/items.json');

export function readData() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

export function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}
