
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env loading
function loadEnv() {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ URL atau Key tidak ditemukan di .env! Pastikan .env sudah diupdate ke proyek BARU.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreAll() {
  const backupFile = path.resolve('supabase', 'backups', 'data.json');
  const mediaDir = path.resolve('supabase', 'backups', 'media');

  if (!fs.existsSync(backupFile)) {
    console.error("❌ File backup data.json tidak ditemukan!");
    return;
  }

  const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  console.log(`🚀 Memulai pengembalian data ke ${supabaseUrl}...`);

  // 1. Upload Media
  console.log("📤 Mengunggah kembali file media...");
  const mediaMap = {}; // Old filename -> New URL
  const files = fs.readdirSync(mediaDir);

  for (const file of files) {
    const filePath = path.join(mediaDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    // Check extension
    let contentType = 'image/jpeg';
    if (file.endsWith('.mp4')) contentType = 'video/mp4';
    if (file.endsWith('.png')) contentType = 'image/png';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('report-media')
      .upload(file, fileBuffer, { contentType, upsert: true });

    if (uploadError) {
      console.error(`❌ Gagal upload ${file}:`, uploadError.message);
    } else {
      const { data: urlData } = supabase.storage.from('report-media').getPublicUrl(file);
      mediaMap[file] = urlData.publicUrl;
      console.log(`✅ Uploaded: ${file}`);
    }
  }

  // 2. Restore Database Tables
  // Note: we insert in order to respect potential (though unlikely here) FKs
  const tableOrder = ['student_access_codes', 'schedule_entries', 'activity_reports'];

  for (const table of tableOrder) {
    let rows = data[table] || [];
    if (rows.length === 0) continue;

    console.log(`📥 Memasukkan data ke tabel ${table}... (${rows.length} baris)`);

    // Clean data for insert (remote auto-generated fields if necessary, 
    // but here we might want to keep IDs to maintain relationships)
    
    const preparedRows = rows.map(row => {
      const newRow = { ...row };
      
      // If it's activity_reports, update the media_urls
      if (table === 'activity_reports' && newRow.media_urls) {
        newRow.media_urls = newRow.media_urls.map(oldUrl => {
          try {
            const fileName = path.basename(new URL(oldUrl).pathname);
            return mediaMap[fileName] || oldUrl;
          } catch (e) {
            return oldUrl;
          }
        });
      }
      return newRow;
    });

    const { error } = await supabase.from(table).upsert(preparedRows);
    if (error) {
      console.error(`❌ Gagal restore tabel ${table}:`, error.message);
    } else {
      console.log(`✅ Tabel ${table} berhasil direstore.`);
    }
  }

  console.log(`\n🎉 SEMUA DATA BERHASIL DIPINDAHKAN!`);
  console.log(`Silakan cek aplikasi Anda.`);
}

restoreAll();
