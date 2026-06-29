import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

import { foods, nutritionGoals } from "../schema";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set (check .env.local)");
}

const db = drizzle(neon(url), { schema: { foods, nutritionGoals } });

type SeedFood = {
  tacoId: number;
  name: string;
  category: string | null;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sodium: number | null;
};

async function seedFoods(): Promise<void> {
  const file = resolve(process.cwd(), "src/db/seed/foods.json");
  const data = JSON.parse(readFileSync(file, "utf8")) as SeedFood[];

  // Idempotent: wipe previously imported TACO rows, then re-insert. Custom
  // foods (source = 'custom') are untouched.
  await db.delete(foods).where(eq(foods.source, "taco"));

  const rows = data.map((f) => ({ source: "taco" as const, ...f }));
  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    await db.insert(foods).values(rows.slice(i, i + chunkSize));
  }
  console.log(`Seeded ${rows.length} TACO foods.`);
}

async function seedGoals(): Promise<void> {
  const existing = await db.select({ id: nutritionGoals.id }).from(nutritionGoals).limit(1);
  if (existing.length === 0) {
    await db.insert(nutritionGoals).values({});
    console.log("Created default nutrition goals.");
  } else {
    console.log("Nutrition goals already present, skipping.");
  }
}

async function main(): Promise<void> {
  await seedFoods();
  await seedGoals();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
