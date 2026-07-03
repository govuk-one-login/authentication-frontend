# Playwright Acceptance Tests

Playwright + Cucumber.js acceptance tests for GOV.UK One Login authentication-frontend.

Tests run entirely in Docker against a stubbed backend, exercising real user journeys through the frontend without any AWS dependencies.

## Architecture

```
┌─────────────┐       ┌────────────────────────────────┐
│ test-runner │──────▶│           nginx (proxy)        │
│ (Playwright)│       │  / ──▶ orch-stub               │
│             │       │  /* ──▶ authentication-frontend│
└─────────────┘       └────────────────────────────────┘
                                     │
                              ┌──────┴──────┐
                              │  api-stub   │
                              │  (Express)  │
                              └─────────────┘
```

- **nginx** routes traffic: the root path and `/orchestration-redirect` go to the orch-stub; everything else goes to authentication-frontend.
- **api-stub** is a stateful Express app that simulates the backend API (login, MFA, lockouts, etc.). State is reset between scenarios via `DELETE /test/state`.
- **orch-stub** is the orchestration stub from the [authentication-stubs](https://github.com/govuk-one-login/authentication-stubs) repo. It initiates OIDC flows and redirects into the frontend.
- **test-runner** is a Playwright container that executes Cucumber scenarios against the proxy.

## Prerequisites

- Docker
- The [authentication-stubs](https://github.com/govuk-one-login/authentication-stubs) repo cloned as a sibling directory (i.e. `../authentication-stubs/` relative to `authentication-frontend`)

## Running the tests

### In CI (GitHub Actions)

Tests run automatically on every pull request via the `playwright-acceptance-tests.yml` workflow. It pulls the orch-stub image from ECR rather than building it from source, then runs the same Docker Compose stack. Reports and Docker Compose logs are uploaded as workflow artifacts on every run (including failures).

### Locally (full Docker)

From this directory:

```sh
./scripts/run-local.sh
```

This builds the orch-stub image from the sibling `authentication-stubs` repo, then runs the full Docker Compose stack including the test-runner. Test output appears in the terminal.

### Locally (IntelliJ — click to run)

You can run individual scenarios from IntelliJ by starting the services in Docker and running the tests on your host machine.

#### Why `docker-compose.intellij.yml` exists

When tests run fully in Docker, all services communicate using internal Docker hostnames (e.g. `http://proxy`). When running from IntelliJ, the browser runs on your host machine and can't resolve these internal hostnames. `docker-compose.intellij.yml` overrides the relevant environment variables so that browser-facing redirects point to `http://localhost:4400` instead:

| Variable                                  | Docker run                           | IntelliJ run             | Why                                              |
| ----------------------------------------- | ------------------------------------ | ------------------------ | ------------------------------------------------ |
| `AUTHENTICATION_FRONTEND_URL` (orch-stub) | `http://proxy/`                      | `http://localhost:4400/` | Browser redirect after OIDC                      |
| `STUB_URL` (orch-stub)                    | `http://proxy/`                      | `http://localhost:4400/` | Browser redirect back to orch-stub callback      |
| `ORCH_TO_AUTH_AUDIENCE` (frontend)        | `http://proxy/`                      | `http://localhost:4400/` | JWT audience must match orch-stub's redirect URL |
| `ORCHESTRATION_REDIRECT_URL` (api-stub)   | Not set (defaults to `http://proxy`) | `http://localhost:4400`  | Auth code redirect at end of journey             |
| `SESSION_EXPIRY` (frontend)               | Default (1hr)                        | `86400000` (24hr)        | Prevents session expiry between test runs        |

It also exposes the api-stub on port 8080 so the `Before` hook can reset stub state between scenarios.

#### Setup (one-time)

1. **Install dependencies:**

   ```sh
   cd playwright-acceptance-tests
   npm install
   npx playwright install chromium
   ```

2. **Configure IntelliJ Cucumber.js run template:**

   Go to **Run → Edit Configurations → Edit Configuration Templates → Cucumber.js** and set:
   - **Working directory:** `<project-root>/playwright-acceptance-tests`
   - **Environment variables:** Point to the `.env` file

   This template applies to all scenarios you click play on.

#### Running

1. **Start the services:**

   ```sh
   ./scripts/run-intellij.sh
   ```

   Wait for the "Services are running" message.

2. **Click play** on any scenario in a `.feature` file in IntelliJ.

   Click on a specific `Scenario:` line to run just that test. Clicking at the `Feature:` level will run all scenarios in the directory.

3. **Stop services when done:**

## Test tagging

All scenarios are tagged `@UI` for parity with the existing authentication-acceptance-tests suite.

## Reports and debugging

On failure, each scenario produces:

- A **screenshot** in `reports/screenshots/`
- A **Playwright trace** in `reports/traces/` (open with `npx playwright show-trace <file>.zip`)

An HTML report is generated into `reports/html/`. In CI, all reports and Docker Compose logs are uploaded as workflow artifacts.

## Developing tests

1. Add or edit a `.feature` file in `features/`.
2. Implement step definitions in `src/steps/`.
3. Use page objects from `src/pages/` (extend `BasePage`).
4. The API stub resets between scenarios automatically — if you need new stub behaviour, add routes to `stubs/api-stub/src/`.
