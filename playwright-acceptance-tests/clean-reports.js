const fs = require("fs");
const path = require("path");

const reportsHtmlDir = path.join(__dirname, "reports", "html");

if (!fs.existsSync(reportsHtmlDir)) {
  console.log("No reports/html directory yet – nothing to clean.");
  return;
}

fs.readdirSync(reportsHtmlDir, { withFileTypes: true }).forEach((entry) => {
  const fullPath = path.join(reportsHtmlDir, entry.name);
  const isTimestamp =
    entry.isDirectory() &&
    /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z?$/.test(entry.name);

  if (!isTimestamp) {
    // delete stray index.html, assets/, features/, etc at root level
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

const entries = fs
  .readdirSync(reportsHtmlDir, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z?$/.test(e.name)
  );

entries.sort((a, b) => b.name.localeCompare(a.name));

const toDelete = entries.slice(2);

toDelete.forEach((dirent) => {
  const folderPath = path.join(reportsHtmlDir, dirent.name);
  fs.rmSync(folderPath, { recursive: true, force: true });
  console.log("Deleted old report folder:", folderPath);
});
