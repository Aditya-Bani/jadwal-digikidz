
import fs from 'fs';
import path from 'path';
import https from 'https';

const backupFile = path.resolve('supabase', 'backups', 'data.json');
const mediaDir = path.resolve('supabase', 'backups', 'media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); 
      reject(err);
    });
  });
}

async function rescueMedia() {
  if (!fs.existsSync(backupFile)) {
    console.error("❌ File data.json tidak ditemukan! Jalankan rescue-db.js dulu.");
    return;
  }

  const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  const reports = data.activity_reports || [];
  
  console.log(`📸 Memulai penyelamatan media dari ${reports.length} laporan...`);

  let downloadedCount = 0;
  let errorCount = 0;

  for (const report of reports) {
    const urls = report.media_urls || [];
    for (const url of urls) {
      try {
        // Extract filename from URL
        const fileName = path.basename(new URL(url).pathname);
        const dest = path.join(mediaDir, fileName);
        
        if (fs.existsSync(dest)) {
          console.log(`⏩ Skipping (already exists): ${fileName}`);
          continue;
        }

        console.log(`📥 Downloading: ${fileName}...`);
        await downloadFile(url, dest);
        downloadedCount++;
      } catch (err) {
        console.error(`❌ Gagal download ${url}:`, err.message);
        errorCount++;
      }
    }
  }

  console.log(`\n🎉 SELESAI!`);
  console.log(`✅ Berhasil download: ${downloadedCount} file.`);
  if (errorCount > 0) console.log(`⚠️ Gagal: ${errorCount} file.`);
  console.log(`📂 Lokasi media: ${mediaDir}`);
}

rescueMedia();
