import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "../support/expect";
import type { PlaywrightWorld } from "../support/world";

import { EnterEmailPage } from "../pages/EnterEmailPage";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { CheckYourPhonePage } from "../pages/CheckYourPhonePage";
import { YouHaveOneLoginPage } from "../pages/YouHaveOneLoginPage";
import { EnterAuthenticatorAppCodePage } from "../pages/EnterAuthenticatorAppCodePage";
import { LockoutPage } from "../pages/LockoutPage";

function requirePage(world: PlaywrightWorld) {
  if (!world.page) throw new Error("Playwright page is not initialised");
  return world.page;
}

/* ---- Enter email ---- */

When(
  "I enter my email address",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = new EnterEmailPage(requirePage(this));
    await page.enterEmail("test@example.com");
    await page.clickContinue();
  }
);

/* ---- Enter password ---- */

Then(
  'I am taken to the "enter your password" page',
  async function (this: PlaywrightWorld): Promise<void> {
    await new EnterPasswordPage(requirePage(this)).assertLoaded();
  }
);

When(
  "I enter my password",
  async function (this: PlaywrightWorld): Promise<void> {
    await new EnterPasswordPage(requirePage(this)).enterPasswordAndContinue(
      "valid-password-1"
    );
  }
);

/* ---- Check your phone (SMS MFA) ---- */

Then(
  'I am taken to the "check your phone" page',
  async function (this: PlaywrightWorld): Promise<void> {
    await new CheckYourPhonePage(requirePage(this)).assertLoaded();
  }
);

When(
  "I enter the SMS security code",
  async function (this: PlaywrightWorld): Promise<void> {
    await new CheckYourPhonePage(requirePage(this)).enterCodeAndContinue(
      "123456"
    );
  }
);

/* ---- Outcome pages ---- */

Then(
  "I am returned to the service",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await expect(page.getByText(/session id/i)).toBeVisible({
      timeout: 15000,
    });
  }
);

Then(
  'I am taken to the "You have a GOV.UK One Login" page',
  async function (this: PlaywrightWorld): Promise<void> {
    await new YouHaveOneLoginPage(requirePage(this)).assertLoaded();
  }
);

/* ---- Create account flow (for duplicate email scenario) ---- */

When(
  "I click Create your GOV.UK One Login",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page
      .getByRole("button", { name: /create your gov\.uk one login/i })
      .click();
  }
);

Then(
  'I am taken to the "enter your email" create account page',
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await expect(
      page.getByRole("heading", { name: /enter your email address/i })
    ).toBeVisible();
  }
);

/* ---- Auth app MFA ---- */

When(
  "I enter the auth app email address",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = new EnterEmailPage(requirePage(this));
    await page.enterEmail("authapp@example.com");
    await page.clickContinue();
  }
);

Then(
  'I am taken to the "enter authenticator app code" page',
  async function (this: PlaywrightWorld): Promise<void> {
    await new EnterAuthenticatorAppCodePage(requirePage(this)).assertLoaded();
  }
);

/* ---- Lockout retry loops ---- */

When(
  "I enter an incorrect password {int} times",
  async function (this: PlaywrightWorld, count: number): Promise<void> {
    const page = new EnterPasswordPage(requirePage(this));
    for (let i = 0; i < count; i++) {
      await page.enterPasswordAndContinue("wrong-password");
      if (i < count - 1) {
        await page.assertLoaded();
        await page.assertInlineError();
      }
    }
  }
);

When(
  "I enter an incorrect SMS security code {int} times",
  async function (this: PlaywrightWorld, count: number): Promise<void> {
    const page = new CheckYourPhonePage(requirePage(this));
    for (let i = 0; i < count; i++) {
      await page.enterCodeAndContinue("000000");
      if (i < count - 1) {
        await page.assertLoaded();
        await page.assertInlineError();
      }
    }
  }
);

When(
  "I enter an incorrect auth app security code {int} times",
  async function (this: PlaywrightWorld, count: number): Promise<void> {
    const page = new EnterAuthenticatorAppCodePage(requirePage(this));
    for (let i = 0; i < count; i++) {
      await page.enterCodeAndContinue("000000");
      if (i < count - 1) {
        await page.assertLoaded();
        await page.assertInlineError();
      }
    }
  }
);

When(
  "I request the SMS security code a further {int} times",
  async function (this: PlaywrightWorld, count: number): Promise<void> {
    const page = requirePage(this);
    for (let i = 0; i < count; i++) {
      await page.getByText(/problems with the code/i).click();
      await page.getByRole("link", { name: /send the code again/i }).click();
      await page.getByRole("button", { name: /get security code/i }).click();
      if (i < count - 1) {
        await new CheckYourPhonePage(page).assertLoaded();
      }
    }
  }
);

/* ---- Lockout assertions ---- */

Then(
  "the {string} lockout screen is displayed",
  async function (this: PlaywrightWorld, heading: string): Promise<void> {
    await new LockoutPage(requirePage(this)).assertHeading(heading);
  }
);

Then(
  "the lockout duration is {int} hours",
  async function (this: PlaywrightWorld, hours: number): Promise<void> {
    await new LockoutPage(requirePage(this)).assertDuration(`${hours} hours`);
  }
);

Then(
  "the lockout reason is {string}",
  async function (this: PlaywrightWorld, reason: string): Promise<void> {
    await new LockoutPage(requirePage(this)).assertReason(reason);
  }
);

Given(
  "the lockout has not yet expired",
  async function (this: PlaywrightWorld): Promise<void> {
    // No-op — lockout state persists in Imposter stores across browser sessions
  }
);

When(
  "I start a new journey from the stub",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    const url = process.env.BASE_URL;
    if (!url) throw new Error("BASE_URL not set");
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /submit/i }).click();
  }
);

/* ---- Welsh language toggle ---- */

When(
  "I switch to Welsh",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.locator("nav").getByRole("link", { name: "Cymraeg" }).click();
    // The frontend sets lng cookie with Secure flag, which doesn't work over
    // HTTP in docker. Re-set it without Secure so subsequent navigations
    // preserve the Welsh language.
    const url = new URL(page.url());
    await page.context().addCookies([
      {
        name: "lng",
        value: "cy",
        domain: url.hostname,
        path: "/",
      },
    ]);
  }
);

Then(
  "I should see the Welsh sign-in-or-create page",
  async function (this: PlaywrightWorld): Promise<void> {
    await expect(
      requirePage(this).getByRole("heading", {
        name: /Creu eich GOV\.UK One/i,
      })
    ).toBeVisible();
  }
);

When(
  "I switch back to English",
  async function (this: PlaywrightWorld): Promise<void> {
    await requirePage(this)
      .locator("nav")
      .getByRole("link", { name: "English" })
      .click();
  }
);

/* ---- Welsh deep flow ---- */

When(
  "I click the Welsh sign in button",
  async function (this: PlaywrightWorld): Promise<void> {
    await requirePage(this)
      .getByRole("button", { name: /mewngofnodi/i })
      .click();
  }
);

Then(
  "I should see the Welsh enter your email page",
  async function (this: PlaywrightWorld): Promise<void> {
    await expect(
      requirePage(this).getByRole("heading", {
        name: /Rhowch eich cyfeiriad e-bost i fewngofnodi/i,
      })
    ).toBeVisible();
  }
);

When(
  "I enter my email address in Welsh",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.getByRole("textbox").fill("test@example.com");
    await page.getByRole("button", { name: /parhau/i }).click();
  }
);

Then(
  "I should see the Welsh enter your password page",
  async function (this: PlaywrightWorld): Promise<void> {
    await expect(
      requirePage(this).getByRole("heading", {
        name: /Rhowch eich cyfrinair/i,
      })
    ).toBeVisible();
  }
);

When(
  "I click the Welsh back link",
  async function (this: PlaywrightWorld): Promise<void> {
    await requirePage(this).getByRole("link", { name: "Yn ôl" }).click();
  }
);

/* ---- Seamless re-sign-in (silent login) ---- */

Then(
  'I am taken to the "enter a security code to continue" page',
  async function (this: PlaywrightWorld): Promise<void> {
    await expect(
      requirePage(this).getByRole("heading", {
        name: /enter a security code to continue/i,
      })
    ).toBeVisible();
  }
);

When(
  "I start a second sign-in journey",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    const url = process.env.BASE_URL;
    if (!url) throw new Error("BASE_URL not set");
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /submit/i }).click();
  }
);

When(
  "I start a second sign-in journey requesting 2FA",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    const url = process.env.BASE_URL;
    if (!url) throw new Error("BASE_URL not set");
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator("#authenticated-2").click();
    await page.getByRole("button", { name: /submit/i }).click();
  }
);
