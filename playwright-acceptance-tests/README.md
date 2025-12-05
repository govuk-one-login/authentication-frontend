# Playwright Acceptance Tests – GOV.UK One Login

This repository contains the Playwright + TypeScript + Cucumber.js acceptance-test suite for
validating core authentication journeys within GOV.UK One Login.

The project is designed to be scalable, CI-friendly, and aligned with GOV.UK engineering practices,
with built-in support for reporting, flaky-test analysis, environment configuration, and browser selection.

### Table of Contents

- Overview
- Tech Stack
- Project Structure
- Environment Variables
- Installation
- Running Tests
- Tags & Filtering
- Reporting
- Scripts
- Adding New Tests
- Development Standards
- Troubleshooting
- Roadmap

### Overview

This project provides automated acceptance coverage for user journeys in GOV.UK One Login, specifically focusing on:

- Create or sign-in journeys
- Journeys for isolated FE testing
- Browser-based flow validation
- Error-state and negative-path handling
- Optional accessibility checks
- Optional security-header checks

The suite is intentionally lightweight and modular, supporting migration from Selenium-Java to Playwright-TypeScript.

Tests will run locally or in CI (GitHub Actions / AWS CodeBuild), using environment variables to configure runtime behaviour.

### Tech Stack

```
Component	Version / Notes
Playwright	1.56.1
Cucumber.js	9.6.0
TypeScript	5.9.3
Node	Recommended: Node 20 LTS
ESLint	Enabled
Prettier	Enabled
dotenv	.env loading
multiple-cucumber-html-reporter	HTML reporting
axe-core/playwright	Optional a11y testing
```

### Project Structure

```
playwright-acceptance-tests/
│
├── features/
│   ├── create-or-signin.feature
│   └── stub-journey.feature
│
├── reports/
│   ├── cucumber-json/
│   ├── html/
│   └── screenshots/
│
├── src/
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── StubStartPage.ts
│   │   ├── CreateOrSignInPage.ts
│   │   └── EnterEmailPage.ts
│   │
│   ├── steps/
│   │   └── stub-journey.steps.ts
│   │
│   ├── support/
│   │   ├── hooks.ts
│   │   └── world.ts
│   │
│   ├── clean-json.js
│   ├── clean-reports.js
│   ├── run-test-with-report.js
│   └── cucumber.js
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── .eslintrc.cjs
```

### Environment Variables

All runtime behaviour is controlled via .env:

```
BASE_URL=https://orchstub.signin.dev.account.gov.uk/
BROWSER=chromium
HEADLESS=true

A11Y_CHECK=false
SECURITY_CHECK=true

CUCUMBER_FILTER_TAGS=""
```

**Supported variables**

```
Variable	Description
BASE_URL	Entry point for authentication journeys (stub or real environment).
BROWSER	chromium, firefox, webkit
HEADLESS	true/false
A11Y_CHECK	Enables axe-core accessibility scanning
SECURITY_CHECK	Enables lightweight security header checks
CUCUMBER_FILTER_TAGS = Tag expression (e.g. @UI and not @wip)

.env is auto-loaded via cucumber.js.
```

### Installation

Install Node dependencies

```
npm install
```

Install Playwright browsers

```
npx playwright install
```

### Running Tests

Run full suite with HTML report:

```
npm run test
OR
npm test
```

This triggers:

- Cleaning previous reports
- Executing cucumber.js
- Generating JSON + HTML reports
- Storing flaky test history

**Run Cucumber directly (no HTML report):**

```
npm run bdd
```

Run with tag filter:

```
CUCUMBER_FILTER_TAGS="@UI" npm run bdd
```

### Tags & Filtering

Examples:

```
Command	Meaning
CUCUMBER_FILTER_TAGS="@UI"	Run only UI-tagged scenarios
CUCUMBER_FILTER_TAGS="not @wip"	Exclude work-in-progress
CUCUMBER_FILTER_TAGS="@Frontend or @API"	Run either tag
CUCUMBER_FILTER_TAGS="@Frontend and @UI"	Run scenarios with both tags

The value is passed through cucumber.js → config.tags.
```

### Reporting

**JSON output**
Location:

```
reports/json/cucumber-report.json
```

**HTML report (timestamped)**
Generated into:

```
reports/html/<timestamp>/
```

**Screenshots**
Only on failure:

```
reports/screenshots/<scenario>.png
```

**Flaky-test analysis**
Persistent history file:

```
reports/flaky-history.json
```

**The reporter displays:**

```
Total duration
Flaky scenarios ever seen
Flaky scenarios this run
Overall pass/failure metrics

Handled by: run-test-with-report.js
```

### Scripts

From package.json:

```
"scripts": {
"clean:reports": "node clean-reports.js",
"bdd": "cucumber-js",
"bdd:report": "node run-test-with-report.js",
"test": "npm run bdd:report",
"lint": "eslint . --ext .ts",
"format": "prettier --write ."
}
```

### Adding New Tests

**Create feature file**

```
features/new-journey.feature
```

**Create page objects**
Place inside:

```
src/pages/
```

**Create step definitions**
Place inside:

```
src/steps/
```

**Test configuration**
Reuse:

- BasePage
- PlaywrightWorld
- Hooks for browser open/close + screenshot on fail

### Development Standards

**Pre-commit Hook (Husky)**
This project uses a root-level Git pre-commit hook (via Husky + lint-staged) to automatically run
ESLint and Prettier on staged .ts files inside the playwright-acceptance-tests folder.

This ensures all Playwright test code is formatted and linted before every commit.

**Hook location:**

```
authentication-frontend/.husky/pre-commit
```

**Hook content:**

```
#!/usr/bin/env sh

cd playwright-acceptance-tests
npx lint-staged
```

Developers commit normally from the root repository — formatting runs automatically.

- Code quality
- ESLint must pass
- Prettier formatting required
- Keep steps declarative
- Avoid long complex steps

**Page Object Model**

- One class per page
- Define locators at the top
- No assertions inside page objects

**Accessibility**

- Axe-core scans only when A11Y_CHECK=true

**Security**

- Header checks only when SECURITY_CHECK=true

### Troubleshooting

```
Issue	Fix

Tags not filtering	Ensure no spaces around equals in .env (CUCUMBER_FILTER_TAGS="@UI")
Screenshots not saved	Ensure reports/screenshots/ exists or can be created
Browser fails to launch	Run npx playwright install
.env not loading	Ensure .env file exists and cucumber.js can load it
```

### Roadmap

- Add additional authentication flows
- Add OTP stub flows when available
- Add full accessibility suite (WCAG 2.1 AA)
- Add GitHub Actions workflow
- Add AWS CodeBuild support
- Migrate/ create new remaining Selenium acceptance tests journeys
