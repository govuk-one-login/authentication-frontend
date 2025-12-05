const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const report = require("multiple-cucumber-html-reporter");

const rootDir = __dirname;
const jsonDir = path.join(rootDir, "reports", "json");
const historyFile = path.join(rootDir, "reports", "flaky-history.json");

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function getScenarioStatus(scenario) {
  const steps = scenario.steps || [];
  let hasFailed = false;
  let hasPassedStep = false;

  for (const step of steps) {
    const result = step.result || {};
    if (result.status === "failed") {
      hasFailed = true;
    }
    if (result.status === "passed") {
      hasPassedStep = true;
    }
  }

  if (hasFailed) return "failed";
  if (hasPassedStep) return "passed";
  return "unknown";
}

function loadHistory() {
  if (!fs.existsSync(historyFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  } catch {
    return {};
  }
}

function updateStats(stats, key, status) {
  const entry = stats[key] || { passes: 0, fails: 0 };
  if (status === "passed") entry.passes += 1;
  if (status === "failed") entry.fails += 1;
  stats[key] = entry;
}

function processScenarios(featuresArray, history, currentRunStats) {
  for (const feature of featuresArray) {
    const featureName = feature.name || "Unknown feature";
    const elements = feature.elements || [];

    for (const scenario of elements) {
      if ((scenario.keyword || "").toLowerCase() === "background") continue;

      const scenarioName = scenario.name || "Unknown scenario";
      const key = `${featureName} :: ${scenarioName}`;
      const status = getScenarioStatus(scenario);

      if (status === "unknown") continue;

      updateStats(history, key, status);
      updateStats(currentRunStats, key, status);
    }
  }
}

function findFlakyScenarios(stats) {
  const flaky = [];
  for (const [key, entry] of Object.entries(stats)) {
    if (entry.passes > 0 && entry.fails > 0) {
      flaky.push(key);
    }
  }
  return flaky;
}

function calculateFlakyMetrics(cucumberJsonPath) {
  const history = loadHistory();
  const raw = fs.readFileSync(cucumberJsonPath, "utf-8");
  const parsed = JSON.parse(raw);
  const featuresArray = Array.isArray(parsed) ? parsed : [parsed];
  const currentRunStats = {};

  processScenarios(featuresArray, history, currentRunStats);

  fs.mkdirSync(path.dirname(historyFile), { recursive: true });
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  const flakyScenariosEver = findFlakyScenarios(history);
  const flakyScenariosThisRun = findFlakyScenarios(currentRunStats);

  return {
    flakyCountEver: flakyScenariosEver.length,
    totalKnownEver: Object.keys(history).length,
    flakyScenariosEver,
    flakyCountThisRun: flakyScenariosThisRun.length,
    flakyScenariosThisRun,
  };
}

if (fs.existsSync(jsonDir)) {
  for (const entry of fs.readdirSync(jsonDir)) {
    fs.rmSync(path.join(jsonDir, entry), { recursive: true, force: true });
  }
} else {
  fs.mkdirSync(jsonDir, { recursive: true });
}

const startTime = Date.now();

const cucumber = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "cucumber-js",
    "--require-module",
    "ts-node/register",
    "--require",
    "src/support/**/*.ts",
    "--require",
    "src/steps/**/*.ts",
    "--format",
    "json:reports/json/cucumber-report.json",
    "features/**/*.feature",
  ],
  { stdio: "inherit" }
);

const exitCode = typeof cucumber.status === "number" ? cucumber.status : 1;
const elapsedMs = Date.now() - startTime;
const totalDurationStr = formatDuration(elapsedMs);

const jsonFile = path.join(jsonDir, "cucumber-report.json");

if (fs.existsSync(jsonFile)) {
  const timestamp = new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  const reportPath = path.join("reports", "html", timestamp);

  const {
    flakyCountEver,
    totalKnownEver,
    flakyScenariosEver,
    flakyCountThisRun,
    flakyScenariosThisRun,
  } = calculateFlakyMetrics(jsonFile);

  const flakyListEverValue =
    flakyScenariosEver.length > 0 ? flakyScenariosEver.join("<br>") : "None";

  const flakyListThisRunValue =
    flakyScenariosThisRun.length > 0
      ? flakyScenariosThisRun.join("<br>")
      : "None";

  process.stdout.write(`Generating HTML report in: ${reportPath}\n`);

  report.generate({
    jsonDir: "reports/json",
    reportPath,
    pageTitle: "Playwright Acceptance Tests",
    reportName: "Playwright Acceptance Tests",
    pageFooter:
      '<div style="text-align:center; font-size:12px; padding:10px 0;">' +
      "Playwright Acceptance Tests" +
      "</div>",
    displayReportTime: true,
    displayDuration: true,
    openReportInBrowser: false,
    customData: {
      title: "Run info",
      data: [
        {
          label: "Total suite wall-clock time",
          value: totalDurationStr,
        },
        {
          label: "Flaky scenarios (ever)",
          value: `${flakyCountEver} out of ${totalKnownEver}`,
        },
        {
          label: "Flaky scenario list (ever)",
          value: flakyListEverValue,
        },
        {
          label: "Flaky scenarios (this run)",
          value: `${flakyCountThisRun}`,
        },
        {
          label: "Flaky scenario list (this run)",
          value: flakyListThisRunValue,
        },
      ],
    },
  });

  try {
    require("./clean-reports");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Warning: clean-reports.js failed: ${message}\n`);
  }
} else {
  process.stderr.write(
    "No cucumber JSON found at reports/json/cucumber-report.json – HTML report not generated.\n"
  );
}

process.exit(exitCode);
