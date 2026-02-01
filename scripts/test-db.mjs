import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 파일 파싱
const envPath = path.resolve(__dirname, "../.env.local");
const envConfig = {};

try {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      envConfig[key] = value;
    }
  });
} catch (e) {
  console.error(".env.local 파일을 읽을 수 없습니다:", e);
  process.exit(1);
}

const connectionString = envConfig.DATABASE_URL?.replace(":6543", ":5432"); // 6543(Pooler) -> 5432(Direct) 강제 변경 테스트

if (!connectionString) {
  console.error("DATABASE_URL이 설정되지 않았습니다.");
  process.exit(1);
}

console.log(
  "Testing connection to (Direct 5432):",
  connectionString.replace(/:([^:@]+)@/, ":****@"),
);
// The original line had an extra comma at the end, which is removed for syntactical correctness.
// Original: console.log('Testing connection to (Direct 5432):', connectionString.replace(/:([^:@]+)@/, ':****@'));,
// Corrected: console.log('Testing connection to (Direct 5432):', connectionString.replace(/:([^:@]+)@/, ':****@'));

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
});

pool
  .connect()
  .then((client) => {
    console.log("Connection Successful!");
    client
      .query('SELECT * FROM "user" LIMIT 1')
      .then((result) => {
        console.log("User table check:", result.rows);
        client.release();
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error checking user table:", err.message);
        client.release();
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error("Connection Error:", err);
    process.exit(1);
  });
