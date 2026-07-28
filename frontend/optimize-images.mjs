import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

async function optimizeImages() {
  const files = fs.readdirSync(publicDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const filePath = path.join(publicDir, file);
      const baseName = path.basename(file, ext);
      const webpPath = path.join(publicDir, `${baseName}.webp`);

      let width = null;
      if (file.startsWith('Desktop header')) {
        width = 1600;
      } else if (file.startsWith('header')) {
        width = 800;
      } else if (file === 'About.png') {
        width = 800;
      }

      console.log(`Converting ${file} -> ${baseName}.webp (max width: ${width || 'auto'})`);
      try {
        const pipeline = sharp(filePath);
        if (width) {
          pipeline.resize({ width, withoutEnlargement: true });
        }
        await pipeline
          .webp({ quality: 80, effort: 4 })
          .toFile(webpPath);
        
        const originalSize = fs.statSync(filePath).size;
        const newSize = fs.statSync(webpPath).size;
        console.log(`✔ ${file}: ${(originalSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB (${Math.round((1 - newSize/originalSize)*100)}% smaller)`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
      }
    }
  }
}

optimizeImages();
