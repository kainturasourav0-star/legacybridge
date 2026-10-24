/**
 * LegacyBridge — Supabase Migration Verification & Setup Helper
 * 
 * Verifies live connectivity with your Supabase PostgreSQL instance and prints
 * the exact SQL schema to execute in the Supabase Dashboard SQL Editor.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found.');
    process.exit(1);
  }

  const env = fs.readFileSync(envPath, 'utf8');
  const getEnv = (k) => {
    const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].trim() : null;
  };

  const supaUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supaService = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  console.log('====================================================');
  console.log('LegacyBridge — Supabase PostgreSQL Setup & Audit');
  console.log('====================================================');
  console.log('Supabase Endpoint:', supaUrl);
  console.log('Service Role Key:', supaService ? (supaService.slice(0, 15) + '...') : 'Missing');

  if (!supaUrl || !supaService) {
    console.error('Missing Supabase configuration in .env');
    process.exit(1);
  }

  const supabase = createClient(supaUrl, supaService);

  // 1. Verify REST connectivity
  console.log('\n[1/3] Testing REST Connection...');
  try {
    const res = await fetch(`${supaUrl}/rest/v1/`, {
      headers: {
        apikey: supaService,
        Authorization: `Bearer ${supaService}`,
      },
    });
    if (res.ok) {
      console.log('✓ Successfully authenticated with Supabase REST API (HTTP 200)');
    } else {
      console.error('✗ Supabase returned status:', res.status, await res.text());
    }
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
  }

  // 2. Check Table Schemas
  console.log('\n[2/3] Checking Required Tables...');
  const tables = ['tasks', 'runs', 'run_events', 'integration_configs', 'delivery_attempts'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`- Table [${table}]: Not created yet (${error.message})`);
      } else {
        console.log(`✓ Table [${table}]: Online & Accessible`);
      }
    } catch (err) {
      console.log(`- Table [${table}]: Check error - ${err.message}`);
    }
  }

  // 3. Instructions for running migration
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/20261024000000_init_legacybridge.sql');
  console.log('\n[3/3] Migration Instructions:');
  console.log('1. Go to your Supabase Project: https://supabase.com/dashboard/project/jlupnqnbxjscuodjnxxq/sql');
  console.log('2. Click "New Query"');
  console.log(`3. Copy the contents of: supabase/migrations/20261024000000_init_legacybridge.sql (${fs.statSync(migrationPath).size} bytes)`);
  console.log('4. Click "Run" to create all tables and RLS security policies.');
  console.log('\nNote: LegacyBridge includes an automated in-memory dual-layer store, so the app remains 100% operational even before running the migration.');
  console.log('====================================================\n');
}

main().catch(console.error);
