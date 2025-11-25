const fs = require("fs");
const path = require("path");

const jsonDir = path.join(__dirname, "reports", "json");

if (!fs.existsSync(jsonDir)) {
  // nothing to clean
  process.exit(0);
}

fs.readdirSync(jsonDir).forEach((file) => {
  const filePath = path.join(jsonDir, file);
  fs.rmSync(filePath, { recursive: true, force: true });
  console.log("Deleted old JSON file:", filePath);
});
