// ============================================================================
// Direct MongoDB maintenance for the Radiance property database.
//
//   MONGODB_URI="…" node scripts/db-admin.mjs status   # inspect all DBs/collections
//   MONGODB_URI="…" node scripts/db-admin.mjs sync     # replace properties with real data
//   MONGODB_URI="…" node scripts/db-admin.mjs purge    # delete ALL properties docs
//
// The connection string is read from the environment only — never hardcode it.
// `sync` loads src/data/radiance-listings.json (the real inventory) and makes
// the DB match it exactly, keyed by stable string _id.
// ============================================================================
import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";
import path from "node:path";

const URI = process.env.MONGODB_URI;
if (!URI) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}
const DB_NAME = process.env.MONGODB_DB || "realestate";
const COLLECTION = "properties";
const CMD = process.argv[2] || "status";
const ROOT = process.cwd();

function realListings() {
  const p = path.join(ROOT, "src", "data", "radiance-listings.json");
  return JSON.parse(readFileSync(p, "utf8"));
}

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 15000 });

async function main() {
  await client.connect();
  console.log("Connected to Atlas.\n");

  if (CMD === "status") {
    const admin = client.db().admin();
    const { databases } = await admin.listDatabases();
    for (const d of databases) {
      if (["admin", "local", "config"].includes(d.name)) continue;
      const db = client.db(d.name);
      const cols = await db.listCollections().toArray();
      console.log(`DB "${d.name}":`);
      for (const c of cols) {
        const count = await db.collection(c.name).countDocuments();
        console.log(`  - ${c.name}: ${count} docs`);
        if (c.name === COLLECTION && count > 0) {
          const rows = await db.collection(c.name).find({}).limit(100).toArray();
          for (const r of rows) console.log(`      • ${r._id}  |  ${r.title}  |  ${r.city}  |  ₹${r.priceCr} Cr`);
        }
      }
    }
    return;
  }

  const db = client.db(DB_NAME);
  const col = db.collection(COLLECTION);

  if (CMD === "purge") {
    const res = await col.deleteMany({});
    console.log(`Deleted ${res.deletedCount} docs from ${DB_NAME}.${COLLECTION}.`);
    return;
  }

  if (CMD === "sync") {
    const listings = realListings();
    const before = await col.countDocuments();
    const del = await col.deleteMany({});
    const seededAt = new Date().toISOString();
    const docs = listings.map(({ id, ...fields }) => ({ _id: id, ...fields, seededAt }));
    const ins = await col.insertMany(docs, { ordered: false });
    const after = await col.countDocuments();
    console.log(`Sync complete in ${DB_NAME}.${COLLECTION}:`);
    console.log(`  removed ${del.deletedCount} old docs (was ${before})`);
    console.log(`  inserted ${ins.insertedCount} real listings`);
    console.log(`  total now ${after}`);
    const cities = await col.distinct("city");
    console.log(`  cities: ${cities.join(", ")}`);
    return;
  }

  console.error(`Unknown command: ${CMD}`);
  process.exit(1);
}

main()
  .catch((e) => {
    console.error("ERROR:", e.message);
    process.exitCode = 1;
  })
  .finally(() => client.close());
