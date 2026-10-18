const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read .env.local or .env
function getDbUrl() {
  const envFiles = ['.env.local', '.env'];
  for (const f of envFiles) {
    const full = path.resolve(process.cwd(), f);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8');
      const directMatch = content.match(/DIRECT_URL=["']?([^"'\r\n]+)["']?/);
      if (directMatch) return directMatch[1];
      const dbMatch = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (dbMatch) return dbMatch[1];
    }
  }
  return process.env.DIRECT_URL || process.env.DATABASE_URL;
}

async function run() {
  const dbUrl = getDbUrl();
  if (!dbUrl) {
    console.error('❌ No DIRECT_URL or DATABASE_URL found in environment or .env');
    process.exit(1);
  }

  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL!');

    const schemaPath = path.resolve(process.cwd(), 'supabase', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying supabase/schema.sql...');
    await client.query(sql);

    // Notify PostgREST to reload schema cache so changes take effect immediately
    try {
      await client.query("NOTIFY pgrst, 'reload schema';");
      console.log('✅ Notified PostgREST schema cache to reload!');
    } catch (e) {
      // Ignore if notify not supported
    }

    // Verify tables exist
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('✅ Tables present in public schema:');
    res.rows.forEach((r) => console.log(' - ' + r.table_name));

    console.log('\n🎉 Database setup completed successfully!');
  } catch (err) {
    console.error('❌ Database migration error:', err.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

run();

