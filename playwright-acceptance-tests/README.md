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

### Locally

From this directory:

```sh
./scripts/run-local.sh
```

This builds the orch-stub image from the sibling `authentication-stubs` repo, then runs the full Docker Compose stack including the test-runner. Test output appears in the terminal. Local report extraction is not yet supported.

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
