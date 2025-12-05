const fs = require("node:fs");
const path = require("node:path");

const reportsHtmlDir = path.join(__dirname, "reports", "html");

if (!fs.existsSync(reportsHtmlDir)) {
  process.stdout.write("No reports/html directory yet – nothing to clean.\n");
  process.exit(0);
}

for (const entry of fs.readdirSync(reportsHtmlDir, { withFileTypes: true })) {
  const fullPath = path.join(reportsHtmlDir, entry.name);
  const isTimestamp =
    entry.isDirectory() &&
    /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z?$/.test(entry.name);

  if (!isTimestamp) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

const timestampDirs = fs
  .readdirSync(reportsHtmlDir, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z?$/.test(e.name)
  )
  .sort((a, b) => b.name.localeCompare(a.name));

const toDelete = timestampDirs.slice(2);

for (const dirent of toDelete) {
  const folderPath = path.join(reportsHtmlDir, dirent.name);
  fs.rmSync(folderPath, { recursive: true, force: true });
  process.stdout.write(`Deleted old report folder: ${folderPath}\n`);
}
