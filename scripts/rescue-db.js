
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env loading to avoid ESM issues
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
  console.error("URL or Key not found in .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function rescueData() {
  console.log(`🚀 Starting rescue from ${supabaseUrl}...`);
  
  const tables = ['activity_reports', 'schedule_entries', 'student_access_codes'];
  const results = {};

  for (const table of tables) {
    console.log(`📥 Fetching data from ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    
    if (error) {
      console.error(`❌ Error fetching ${table}:`, error.message);
      results[table] = [];
    } else {
      console.log(`✅ Fetched ${data.length} rows from ${table}.`);
      results[table] = data;
    }
  }

  // Ensure backup directory exists
  const backupDir = path.resolve('supabase', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, 'data.json');
  fs.writeFileSync(backupPath, JSON.stringify(results, null, 2));
  
  console.log(`\n🎉 SELESAI! Data telah diselamatkan ke: ${backupPath}`);
  console.log(`\nSilakan cek folder tersebut sebelum Anda mengganti file .env ke proyek baru.`);
}

rescueData();
