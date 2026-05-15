import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations(): Promise<void> {
  try {
    console.log("🔄 Running migrations...");

    // Resolve migrations directory relative to the app root
    const migrationsDir = path.join(__dirname, "../../..", "database", "migrations");

    if (!fs.existsSync(migrationsDir)) {
      console.log("⚠️  Migrations directory not found:", migrationsDir);
      console.log("Creating tables directly...");

      // Create tables inline if migrations directory doesn't exist
      const tables = [
        // Users table
        `CREATE TABLE IF NOT EXISTS "user" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // Notes table
        `CREATE TABLE IF NOT EXISTS note (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // Shared Access table
        `CREATE TABLE IF NOT EXISTS shared_access (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          note_id UUID NOT NULL REFERENCES note(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
          permission VARCHAR(50) DEFAULT 'view',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // Comments table
        `CREATE TABLE IF NOT EXISTS comment (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          note_id UUID NOT NULL REFERENCES note(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // Refresh Tokens table
        `CREATE TABLE IF NOT EXISTS refresh_token (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
          token VARCHAR(500) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`
      ];

      for (const sql of tables) {
        await query(sql);
      }

      console.log("✅ Tables created successfully");
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("⚠️  No migration files found");
      return;
    }

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      console.log(`Running: ${file}`);
      await query(sql);
      console.log(`✅ ${file} completed`);
    }

    console.log("✅ All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

runMigrations();
