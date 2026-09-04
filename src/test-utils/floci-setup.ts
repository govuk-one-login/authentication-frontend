import { execSync } from "node:child_process";

const FLOCI_PORT = 4566;
const FLOCI_ENDPOINT = `http://localhost:${FLOCI_PORT}`;
const COMPOSE_FILE = "docker-compose.integration.yml";

async function isFlociRunning() {
  try {
    await fetch(`${FLOCI_ENDPOINT}/_floci/health`, {
      signal: AbortSignal.timeout(1000),
    });
    return true;
  } catch {
    return false;
  }
}

// Mocha automatically runs any exported function named `mochaGlobalSetup`
// from --require'd files before tests start. See:
// https://mochajs.org/features/global-fixtures/
export async function mochaGlobalSetup(): Promise<void> {
  if (!(await isFlociRunning())) {
    // rule applied as this runs as part of a mocha hook, not in the application
    // eslint-disable-next-line no-console
    console.log("Floci not running, starting via docker compose...");
    execSync(`docker compose -f ${COMPOSE_FILE} up -d --wait`, {
      stdio: "inherit",
    });
  }

  process.env.TEST_SQS_ENDPOINT = FLOCI_ENDPOINT;
}
