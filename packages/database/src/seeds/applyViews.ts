// packages/database/src/seeds/applyViews.ts
import { config } from "dotenv";
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

// .env dosyasını yükle
config();

async function applyViews() {
  const DATABASE_URL = process.env.DATABASE_URL;

  console.log("=== DEBUG INFO ===");
  console.log("DATABASE_URL:", DATABASE_URL);
  console.log("Current directory:", __dirname);
  console.log("Process cwd:", process.cwd());
  console.log("==================");

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable not set");
    process.exit(1);
  }

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log("🔄 Applying database views...");

    await client.connect();

    // Hangi database'e bağlandığını göster
    const dbInfo = await client.query(
      "SELECT current_database(), current_user, inet_server_addr(), inet_server_port()"
    );
    console.log("📊 Connected to:", dbInfo.rows[0]);

    const viewsPath = path.join(__dirname, "../../prisma/views.sql");
    console.log("📄 Views SQL path:", viewsPath);

    const viewsSQL = fs.readFileSync(viewsPath, "utf8");

    await client.query(viewsSQL);

    console.log("✅ ProductUnifiedView applied successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error applying views:", error.message);
      console.error(error);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyViews();
