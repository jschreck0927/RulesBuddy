import fs from 'fs';
import csvParse from 'csv-parse/lib/sync';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase credentials not set');
}
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  const csv = fs.readFileSync('Departments_List.csv', 'utf8');
  const records = csvParse(csv, { columns: true });
  for (const rec of records) {
    const code = rec.abbreviation;
    const name = rec.name;
    await supabase.from('departments').insert({ code, name, state: code });
    console.log(`Inserted ${name}`);
  }
  console.log('Done seeding departments.');
}

seed().catch((err) => {
  console.error(err);
});