import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

async function optimizePngs() {
  const files = fs.readdirSync(publicDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png') {
      const filePath = path.join(publicDir, file);
      const tmpPath = path.join(publicDir, `tmp_${file}`);

      let width = null;
      if (file.startsWith('Desktop header')) {
        width = 1600;
      } else if (file.startsWith('header')) {
        width = 800;
      } else if (file === 'About.png') {
        width = 800;
      }

      try {
        const pipeline = sharp(filePath);
        if (width) {
          pipeline.resize({ width, withoutEnlargement: true });
        }
        await pipeline
          .png({ quality: 75, compressionLevel: 9, palette: true })
          .toFile(tmpPath);
        
        fs.renameSync(tmpPath, filePath);
        const newSize = fs.statSync(filePath).size;
        console.log(`✔ Compressed PNG ${file}: ${(newSize/1024).toFixed(1)}KB`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      }
    }
  }
}

optimizePngs();
