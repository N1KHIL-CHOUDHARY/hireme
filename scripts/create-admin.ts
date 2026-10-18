import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manually without external dependency
function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  for (const p of envPaths) {
    const full = path.resolve(process.cwd(), p);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const args = process.argv.slice(2);
  const name = args[0] || 'Admin';
  const email = args[1] || 'admin@hirelytics.app';
  const password = args[2] || 'Admin@123456';

  console.log(`Creating/updating admin user: ${name} (${email})...`);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existingUser) {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        name,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existingUser.id);

    if (updateError) {
      console.error('❌ Failed to update admin user:', updateError.message);
      process.exit(1);
    }
    console.log(`✅ Admin user updated successfully! ID: ${existingUser.id}`);
  } else {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ Failed to create admin user:', insertError.message);
      process.exit(1);
    }
    console.log(`✅ Admin user created successfully! ID: ${newUser.id}`);
  }
}

createAdmin().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
