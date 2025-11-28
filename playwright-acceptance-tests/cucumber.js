const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const tagExpression = process.env.CUCUMBER_FILTER_TAGS;

console.log("CUCUMBER_FILTER_TAGS from .env =", tagExpression);

module.exports = {
  paths: ["features/**/*.feature"],
  require: ["src/support/**/*.ts", "src/steps/**/*.ts"],
  requireModule: ["ts-node/register"],
  format: ["json:reports/json/cucumber-report.json"],
  ...(tagExpression?.trim() ? { tags: tagExpression.trim() } : {}),
};
