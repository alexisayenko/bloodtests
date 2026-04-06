#!/usr/bin/env node
/**
 * Seed script: reads JSON data files and inserts them into Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=sb_secret_... node scripts/seed.mjs
 *
 * Requires: @supabase/supabase-js (uses dynamic import from CDN via npx or local install)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://hvcfhywtbsxpgjxlvxww.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_KEY env var (find it in Supabase > Settings > API Keys > Secret key)');
  process.exit(1);
}

// Target user UUID — John Smith (alex.isayenko@gmail.com)
const TARGET_USER_ID = process.argv[2] || 'f49e8347-87a5-46bf-b771-bb45ede2786f';

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DATA_DIR = join(import.meta.dirname, '..', 'data', 'users', 'alex');
const RESULTS_DIR = join(DATA_DIR, 'results-by-date');

async function seed() {
  console.log(`Seeding data for user ${TARGET_USER_ID}...`);

  // 1. Read manifest
  const manifest = JSON.parse(readFileSync(join(RESULTS_DIR, 'manifest.json'), 'utf-8'));
  console.log(`Found ${manifest.length} test sessions in manifest`);

  let totalResults = 0;

  // Known lab name corrections
  const labFixes = {
    '2025-08': 'NeoGenesis',
    '2026-01': 'NeoGenesis',
  };

  // Skip future dates and unresolved Unknown Lab placeholders
  const today = new Date().toISOString().slice(0, 10);
  const realEntries = manifest.filter(e => {
    if (e.date > today) return false;
    if (e.place === 'Unknown Lab' && !labFixes[e.date?.slice(0, 7)]) return false;
    return true;
  });
  console.log(`Skipping ${manifest.length - realEntries.length} future/placeholder sessions`);

  for (const entry of realEntries) {
    const fileName = entry.file.replace(/\\/g, '/').split('/').pop();
    const filePath = join(RESULTS_DIR, fileName);

    let sessionData;
    try {
      sessionData = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.warn(`  Skipping ${fileName}: ${e.message}`);
      continue;
    }

    // Apply lab name fix
    let place = sessionData.place || null;
    const monthKey = sessionData.date?.slice(0, 7);
    if (labFixes[monthKey]) place = labFixes[monthKey];

    // Insert test_session
    const { data: session, error: sessErr } = await sb
      .from('test_sessions')
      .upsert({
        user_id: TARGET_USER_ID,
        date: sessionData.date,
        place: place,
        source_file: sessionData.sourceFile || null,
      }, { onConflict: 'user_id,date,place' })
      .select('id')
      .single();

    if (sessErr) {
      console.error(`  Error inserting session ${entry.date} ${entry.place}:`, sessErr.message);
      continue;
    }

    console.log(`  Session ${sessionData.date} @ ${sessionData.place} → ${session.id}`);

    // Insert results for this session
    const items = sessionData.items || [];
    if (items.length === 0) continue;

    const resultRows = items
      .filter(r => r.value != null || r.rawValue != null) // skip empty/planned markers
      .map(r => ({
        session_id: session.id,
        user_id: TARGET_USER_ID,
        loinc: r.loinc || null,
        analysis: r.analysis || null,
        symbol: r.symbol || null,
        section: r.section || null,
        value: r.value != null ? r.value : null,
        raw_value: r.rawValue || null,
        value_qualifier: r.valueQualifier || null,
        unit: r.unit || null,
        ref_text: r.refText || null,
        ref_min: r.refMin != null ? r.refMin : null,
        ref_max: r.refMax != null ? r.refMax : null,
        method: r.method || null,
      }));

    if (resultRows.length > 0) {
      const { error: resErr } = await sb.from('results').insert(resultRows);
      if (resErr) {
        console.error(`    Error inserting results:`, resErr.message);
      } else {
        totalResults += resultRows.length;
        console.log(`    Inserted ${resultRows.length} results`);
      }
    }
  }

  // 2. Seed planned tests
  const planned = JSON.parse(readFileSync(join(DATA_DIR, 'planned.json'), 'utf-8'));
  if (planned.length > 0) {
    const plannedRows = planned.map(p => ({
      user_id: TARGET_USER_ID,
      planned_date: p.plannedDate || null,
      test_type: p.testType || null,
      notes: p.notes || null,
    }));

    const { error: planErr } = await sb.from('planned_tests').insert(plannedRows);
    if (planErr) {
      console.error('Error inserting planned tests:', planErr.message);
    } else {
      console.log(`Inserted ${plannedRows.length} planned tests`);
    }
  }

  console.log(`\nDone! Seeded ${manifest.length} sessions, ${totalResults} results, ${planned.length} planned tests.`);
}

seed().catch(err => { console.error(err); process.exit(1); });
