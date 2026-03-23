const path = require("node:path");
const fs = require("node:fs");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const tagExpression = process.env.CUCUMBER_FILTER_TAGS;

module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    require: ["src/support/**/*.ts", "src/steps/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["json:reports/json/cucumber-report.json"],
    ...(tagExpression && tagExpression.trim() !== ""
      ? { tags: tagExpression.trim() }
      : {}),
  },
};
