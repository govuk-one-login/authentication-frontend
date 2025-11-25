import path from 'node:path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const tagExpression = process.env.CUCUMBER_FILTER_TAGS;

console.log('CUCUMBER_FILTER_TAGS from .env =', tagExpression);

const config = {

  paths: ['features/**/*.feature'],

  require: ['src/support/**/*.ts', 'src/steps/**/*.ts'],

  requireModule: ['ts-node/register'],

  format: ['json:reports/json/cucumber-report.json'],

  ...(tagExpression && tagExpression.trim() !== ''
    ? { tags: tagExpression.trim() }
    : {}),
};

export default config;
