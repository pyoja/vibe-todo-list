import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target binary
const cmd = path.join(__dirname, "..", "node_modules", ".bin", "oh-my-ag.cmd");
const args = ["bridge"];

// Spawn with filtered output
const child = spawn(cmd, args, {
  cwd: path.join(__dirname, ".."),
  shell: true, // Required for Windows cmd execution
  env: {
    ...process.env,
    SERENA_LOG_LEVEL: "CRITICAL",
    LOG_LEVEL: "CRITICAL",
    NO_COLOR: "1",
  },
  // Use pipe for all stdio to ensure we control the streams manually
  stdio: ["pipe", "pipe", "pipe"],
});

// Manually pipe stdin to ensure reliable connection on Windows
process.stdin.pipe(child.stdin);

// Filter stdout: Only pass valid JSON-RPC parts
child.stdout.on("data", (data) => {
  const lines = data.toString().split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Pass strictly JSON or MCP headers
    // Using a more generous check to capture split chunks if necessary, but line-based is usually fine
    if (trimmed.startsWith("{") || trimmed.startsWith("Content-Length:")) {
      process.stdout.write(line + "\n");
    } else {
      // Send interference logs to stderr
      process.stderr.write(`[LOG] ${line}\n`);
    }
  });
});

// Pass stderr through directly
child.stderr.on("data", (data) => {
  process.stderr.write(data);
});

child.on("exit", (code) => process.exit(code || 0));
child.on("error", (err) => {
  process.stderr.write(`Spawn Error: ${err.message}\n`);
  process.exit(1);
});
