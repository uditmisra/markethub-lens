/**
 * Auto-tag existing G2 reviews based on keyword matching.
 * Run once: node scripts/auto-tag-reviews.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pbtcvovzqhdniltllrbn.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidGN2b3Z6cWhkbmlsdGxscmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1Nzg4OCwiZXhwIjoyMDg4MDMzODg4fQ.WJ9Fndic1SadMHpR5K5KkYzayM_Yq9fzDHQ9py4a9jg";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// keyword → tag name mapping (tag names must match seeds in migration)
const TAG_RULES = [
  // Use cases
  { keywords: ["contract", "agreement", "clm", "contract management", "contract lifecycle"], tag: "Contract Management" },
  { keywords: ["sign", "signature", "esign", "e-sign", "signing"], tag: "E-Signatures" },
  { keywords: ["workflow", "automation", "automated", "automate"], tag: "Workflow Automation" },
  { keywords: ["template"], tag: "Template Management" },
  { keywords: ["collaboration", "collaborate", "redline", "version"], tag: "Team Collaboration" },
  { keywords: ["document", "draft", "drafting", "upload"], tag: "Document Automation" },
  { keywords: ["compliance", "secure", "security"], tag: "Compliance & Security" },
  // Personas
  { keywords: ["legal team", "legal professional", "in-house legal", "lawyer", "counsel", "attorney"], tag: "Legal Team" },
  { keywords: ["sales", "salesforce", "crm"], tag: "Sales Team" },
  { keywords: ["operations", " ops ", "operation team"], tag: "Operations" },
  { keywords: ["finance", "financial"], tag: "Finance" },
  // Sentiments
  { keywords: ["easy to use", "ease of use", "user friendly", "user-friendly", "intuitive", "simple to use", "simple interface"], tag: "Ease of Use" },
  { keywords: ["support team", "customer support", "csm", "customer success", "responsive team", "helpdesk"], tag: "Customer Support" },
  { keywords: ["implementation", "onboarding", "seamless", "easy to implement", "set up", "getting started"], tag: "Fast Implementation" },
  { keywords: ["time saving", "save time", "saves time", "efficiency", "efficient", "productivity", "roi", "reduce time", "faster"], tag: "ROI Story" },
  { keywords: ["switched", "switching from", "migrated from", "previously used", "before spotdraft", "moved from"], tag: "Switching Story" },
  { keywords: ["ai feature", "ai-powered", "repository", "metadata", "integration", "api", "salesforce integration"], tag: "Feature Praise" },
];

// Fetch all tags from DB
const { data: allTags, error: tagsError } = await supabase.from("tags").select("id, name");
if (tagsError) { console.error("Failed to fetch tags:", tagsError); process.exit(1); }

const tagByName = Object.fromEntries(allTags.map((t) => [t.name.toLowerCase(), t.id]));

// Fetch all evidence
const { data: evidence, error: evErr } = await supabase.from("evidence").select("id, content, title");
if (evErr) { console.error("Failed to fetch evidence:", evErr); process.exit(1); }

console.log(`Processing ${evidence.length} evidence items…`);

let totalTagged = 0;

for (const item of evidence) {
  const text = `${item.title} ${item.content}`.toLowerCase();
  const matchedTagIds = new Set();

  for (const rule of TAG_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      const tagId = tagByName[rule.tag.toLowerCase()];
      if (tagId) matchedTagIds.add(tagId);
    }
  }

  if (matchedTagIds.size === 0) continue;

  // Upsert evidence_tags (ignore duplicates)
  const rows = [...matchedTagIds].map((tag_id) => ({ evidence_id: item.id, tag_id }));
  const { error } = await supabase.from("evidence_tags").upsert(rows, { onConflict: "evidence_id,tag_id", ignoreDuplicates: true });
  if (error) {
    console.error(`  Error tagging ${item.id}:`, error.message);
  } else {
    totalTagged += rows.length;
    console.log(`  [${item.id.slice(0, 8)}] → ${rows.length} tags`);
  }
}

console.log(`\nDone — applied ${totalTagged} tags across ${evidence.length} items.`);
