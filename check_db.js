import { supabase } from './src/integrations/supabase/client.js';

async function checkAccess() {
    console.log('Checking read access to admin_notifications...');
    const { data, error } = await supabase.from('admin_notifications').select('*').limit(1);
    if (error) {
        console.error('❌ Access Denied:', error.message);
    } else {
        console.log('✅ Access Granted! Data length:', data.length);
    }
}

checkAccess();
