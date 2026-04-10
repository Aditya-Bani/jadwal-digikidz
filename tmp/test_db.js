
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testConnection() {
  console.log("Checking URL:", process.env.VITE_SUPABASE_URL);
  const { data, error } = await supabase.from('activity_reports').select('*').limit(1);
  if (error) {
    console.error("Error fetching data:", error);
  } else {
    console.log("Data found:", data);
  }
}

testConnection();
