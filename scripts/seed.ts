import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db, client } from '../src/server/db/client';
import { eventTemplates, templateItems, priceBenchmarks } from '../src/server/db/schema';

async function seed() {
  console.log('🌱 Starting Soirée database seeding...');

  try {
    // 1. Seed Event Templates
    const seedDir = path.resolve(process.cwd(), 'data/seed');
    const templateFiles = fs.readdirSync(seedDir).filter((f) => f.endsWith('.json'));

    for (const file of templateFiles) {
      const filePath = path.join(seedDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`  Importing template: ${content.title} (${content.event_type})`);

      await db
        .insert(eventTemplates)
        .values({
          id: content.id,
          event_type: content.event_type,
          title: content.title,
          description: content.description,
          default_budget_split: content.default_budget_split,
        })
        .onConflictDoUpdate({
          target: eventTemplates.id,
          set: {
            title: content.title,
            description: content.description,
            default_budget_split: content.default_budget_split,
          },
        });

      if (content.items && Array.isArray(content.items)) {
        for (const item of content.items) {
          await db.insert(templateItems).values({
            template_id: content.id,
            type: item.type,
            title: item.title,
            relative_days_before: item.relative_days_before,
            phase: item.phase,
            metadata: item.metadata || {},
          });
        }
      }
    }

    // 2. Seed Price Benchmarks
    const benchmarksDir = path.resolve(process.cwd(), 'data/benchmarks');
    const benchmarkFiles = fs.readdirSync(benchmarksDir).filter((f) => f.endsWith('.json'));

    for (const file of benchmarkFiles) {
      const filePath = path.join(benchmarksDir, file);
      const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`  Importing benchmarks: ${file} (${items.length} records)`);

      for (const item of items) {
        await db.insert(priceBenchmarks).values({
          region: item.region,
          event_type: item.event_type,
          category: item.category,
          min_cost: item.min_cost.toString(),
          max_cost: item.max_cost.toString(),
          unit: item.unit,
        });
      }
    }

    console.log('✅ Database seeded successfully!');
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('⚠️ Seeding note (Database connection):', error.message);
    console.log('💡 When you provide an active DATABASE_URL in .env.local, run: npm run db:seed');
  } finally {
    await client.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(0);
});
