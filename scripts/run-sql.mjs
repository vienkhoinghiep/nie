// Run SQL via Supabase Management API
// Usage: node scripts/run-sql.mjs <path-to-sql-file>

import fs from "node:fs";
import path from "node:path";

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_REF;
const file = process.argv[2];

if (!PAT || !REF || !file) {
  console.error("Required: SUPABASE_PAT, SUPABASE_PROJECT_REF env vars, and SQL file arg");
  process.exit(2);
}

const sql = fs.readFileSync(file, "utf8");
console.log(`SQL file: ${file} (${sql.length} chars)`);

const start = Date.now();
const resp = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${PAT}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const elapsed = ((Date.now() - start) / 1000).toFixed(1);
const text = await resp.text();
console.log(`HTTP ${resp.status} in ${elapsed}s`);

if (!resp.ok) {
  console.error("ERROR body:");
  console.error(text.slice(0, 4000));
  process.exit(1);
}

try {
  const json = JSON.parse(text);
  if (Array.isArray(json)) {
    console.log(`OK — returned ${json.length} rows`);
    if (json.length > 0 && json.length <= 20) console.log(json);
  } else {
    console.log("OK", json);
  }
} catch {
  console.log("OK (non-JSON)", text.slice(0, 500));
}
