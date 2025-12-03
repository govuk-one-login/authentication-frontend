const fs = require("node:fs");
const path = require("node:path");

const jsonDir = path.join(__dirname, "reports", "json");

if (!fs.existsSync(jsonDir)) {
  process.exit(0);
}

for (const file of fs.readdirSync(jsonDir)) {
  const filePath = path.join(jsonDir, file);
  fs.rmSync(filePath, { recursive: true, force: true });
  process.stdout.write(`Deleted old JSON file: ${filePath}\n`);
}
