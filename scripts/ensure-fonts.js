// This script ensures the Japanese font is copied to the lib directory for build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const projectRoot = path.resolve(__dirname, '..');
const sourceFont = path.join(projectRoot, 'static/fonts/NotoSansJP-Regular.ttf');
const targetDir = path.join(projectRoot, 'src/lib/fonts');
const targetFont = path.join(targetDir, 'NotoSansJP-Regular.ttf');

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy the font file
try {
  if (fs.existsSync(sourceFont)) {
    console.log(`Copying font from ${sourceFont} to ${targetFont}`);
    fs.copyFileSync(sourceFont, targetFont);
    console.log('Font copied successfully');
  } else {
    console.error(`Source font not found at: ${sourceFont}`);
  }
} catch (err) {
  console.error('Error copying font:', err);
}