import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "../support/expect";
import type { PlaywrightWorld } from "../support/world";

import { CreateOrSignInPage } from "../pages/CreateOrSignInPage";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { CheckYourPhonePage } from "../pages/CheckYourPhonePage";
import { EnterAuthAppCodePage } from "../pages/EnterAuthAppCodePage";
import { AccountLockedPage } from "../pages/AccountLockedPage";
import { YouHaveAOneLoginPage } from "../pages/YouHaveAOneLoginPage";

function getPage(world: PlaywrightWorld) {
  if (!world.page) throw new Error("Playwright page is not initialised");
  return world.page;
}

/* -----------------------------------------
   Stub options
------------------------------------------ */

Given(
  "I select the 2fa-off stub option",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = getPage(this);
    await page.locator("#level-2").click();
  }
);

/* -----------------------------------------
   Email entry
------------------------------------------ */

When(
  "I enter email {string}",
  async function (this: PlaywrightWorld, email: string): Promise<void> {
    const page = getPage(this);
    await expect(page.getByRole("textbox")).toBeVisible();
    await page.getByRole("textbox").fill(email);
    await page.getByRole("button", { name: /continue/i }).click();
  }
);

When(
  "I enter email {string} in Welsh",
  async function (this: PlaywrightWorld, email: string): Promise<void> {
    const page = getPage(this);
    await page.getByRole("textbox").fill(email);
    await page.getByRole("button", { name: "Parhau" }).click();
  }
);

/* -----------------------------------------
   Password entry
------------------------------------------ */

Then(
  "I am taken to the enter your password page",
  async function (this: PlaywrightWorld): Promise<void> {
    const passwordPage = new EnterPasswordPage(getPage(this));
    await passwordPage.assertLoaded();
  }
);

When(
  "I enter password {string}",
  async function (this: PlaywrightWorld, password: string): Promise<void> {
    const page = getPage(this);
    const passwordPage = new EnterPasswordPage(page);
    await passwordPage.assertLoaded();
    await passwordPage.enterPasswordAndContinue(password);
  }
);

/* -----------------------------------------
   Check your phone (SMS MFA)
------------------------------------------ */

Then(
  "I am taken to the check your phone page",
  async function (this: PlaywrightWorld): Promise<void> {
    const phonePage = new CheckYourPhonePage(getPage(this));
    await phonePage.assertLoaded();
  }
);

When(
  "I enter the phone security code {string}",
  async function (this: PlaywrightWorld, code: string): Promise<void> {
    const phonePage = new CheckYourPhonePage(getPage(this));
    await phonePage.enterCodeAndContinue(code);
  }
);

/* -----------------------------------------
   Auth app MFA
------------------------------------------ */

Then(
  "I am taken to the enter authenticator app code page",
  async function (this: PlaywrightWorld): Promise<void> {
    const authAppPage = new EnterAuthAppCodePage(getPage(this));
    await authAppPage.assertLoaded();
  }
);

When(
  "I enter the auth app security code {string}",
  async function (this: PlaywrightWorld, code: string): Promise<void> {
    const authAppPage = new EnterAuthAppCodePage(getPage(this));
    await authAppPage.enterCodeAndContinue(code);
  }
);

/* -----------------------------------------
   Return to service
------------------------------------------ */

Then(
  "I am returned to the service",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = getPage(this);
    await expect(page.getByText(/session id/i)).toBeVisible({
      timeout: 15000,
    });
  }
);

/* -----------------------------------------
   You have a GOV.UK One Login
------------------------------------------ */

Then(
  "I am taken to the you have a GOV.UK One Login page",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = new YouHaveAOneLoginPage(getPage(this));
    await page.assertLoaded();
  }
);

When(
  "I select create an account",
  async function (this: PlaywrightWorld): Promise<void> {
    const createOrSignInPage = new CreateOrSignInPage(getPage(this));
    await createOrSignInPage.clickCreateAccount();
  }
);

Then(
  "I am taken to the enter your email address page",
  async function (this: PlaywrightWorld): Promise<void> {
    await expect(
      getPage(this).getByRole("heading", { name: /enter your email address$/i })
    ).toBeVisible();
  }
);

/* -----------------------------------------
   Lockout: incorrect passwords
------------------------------------------ */

When(
  "I enter an incorrect password {int} times",
  async function (this: PlaywrightWorld, count: number): Promise<void> {
    const passwordPage = new EnterPasswordPage(getPage(this));
    for (let i = 0; i < count; i++) {
      await passwordPage.enterPasswordAndContinue("wrong-password");
      if (i < count - 1) {
        await passwordPage.assertLoaded();
        await passwordPage.assertInlineError();
      }
    }
  }
);

/* -----------------------------------------
   Lockout: incorrect SMS codes
------------------------------------------ */

When(
  "I enter an incorrect phone security code {int} times",
  async function (this: PlaywrightWorld, count: number): Promise<void> {
    const phonePage = new CheckYourPhonePage(getPage(this));
    for (let i = 0; i < count; i++) {
      await phonePage.enterCodeAndContinue("999999");
      if (i < count - 1) {
        await phonePage.assertLoaded();
        await phonePage.assertInlineError();
      }
    }
  }
);

/* -----------------------------------------
   Lockout: too many SMS resends
------------------------------------------ */

When(
  "I request the phone security code a further {int} times",
  async function (this: PlaywrightWorld, count: number): Promise<void> {
    const page = getPage(this);
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

/* -----------------------------------------
   Lockout: incorrect auth app codes
------------------------------------------ */

When(
  "I enter an incorrect auth app security code {int} times",
  async function (this: PlaywrightWorld, count: number): Promise<void> {
    const authAppPage = new EnterAuthAppCodePage(getPage(this));
    for (let i = 0; i < count; i++) {
      await authAppPage.enterCodeAndContinue("999999");
      if (i < count - 1) {
        await authAppPage.assertLoaded();
        await authAppPage.assertInlineError();
      }
    }
  }
);

/* -----------------------------------------
   Lockout screen assertions
------------------------------------------ */

Then(
  "the {string} lockout screen is displayed",
  async function (this: PlaywrightWorld, title: string): Promise<void> {
    const lockoutPage = new AccountLockedPage(getPage(this));
    await lockoutPage.assertHeadingVisible(title);
  }
);

Then(
  "the lockout duration is {int} hours",
  async function (this: PlaywrightWorld, hours: number): Promise<void> {
    const lockoutPage = new AccountLockedPage(getPage(this));
    await lockoutPage.assertContainsText(`${hours} hours`);
  }
);

Then(
  "the lockout reason is {string}",
  async function (this: PlaywrightWorld, reason: string): Promise<void> {
    const lockoutPage = new AccountLockedPage(getPage(this));
    await lockoutPage.assertContainsText(`because ${reason}`);
  }
);

Given(
  "the lockout has not yet expired",
  async function (this: PlaywrightWorld): Promise<void> {
    // Intentionally empty - lockout state is maintained in Imposter stores
  }
);

/* -----------------------------------------
   Language switching
------------------------------------------ */

When(
  "I switch to {string} language",
  async function (this: PlaywrightWorld, language: string): Promise<void> {
    const page = getPage(this);
    if (language.toLowerCase() === "welsh") {
      await page.locator("nav").getByRole("link", { name: "Cymraeg" }).click();
      // The frontend sets lng cookie with Secure flag, which doesn't work over
      // HTTP in docker. Re-set it without Secure so subsequent navigations
      // preserve the Welsh language.
      const url = new URL(page.url());
      await page
        .context()
        .addCookies([
          { name: "lng", value: "cy", domain: url.hostname, path: "/" },
        ]);
    } else {
      await page.locator("nav").getByRole("link", { name: "English" }).click();
    }
  }
);

Then(
  "I am taken to the Welsh create or sign in page",
  async function (this: PlaywrightWorld): Promise<void> {
    await expect(
      getPage(this).getByRole("heading", {
        name: /Creu eich GOV\.UK One/i,
      })
    ).toBeVisible();
  }
);

Then(
  "I am taken to the Welsh enter your email page",
  async function (this: PlaywrightWorld): Promise<void> {
    await expect(
      getPage(this).getByRole("heading", {
        name: /Rhowch eich cyfeiriad e-bost i fewngofnodi/i,
      })
    ).toBeVisible();
  }
);

Then(
  "I am prompted for my password in Welsh",
  async function (this: PlaywrightWorld): Promise<void> {
    const passwordPage = new EnterPasswordPage(getPage(this));
    await passwordPage.assertLoadedWelsh();
  }
);

When(
  "I click link {string}",
  async function (this: PlaywrightWorld, linkText: string): Promise<void> {
    await getPage(this).getByRole("link", { name: linkText }).click();
  }
);

When(
  "I click the sign in button",
  async function (this: PlaywrightWorld): Promise<void> {
    await getPage(this).locator("#sign-in-button").click();
  }
);

When(
  "I click the continue button",
  async function (this: PlaywrightWorld): Promise<void> {
    await getPage(this)
      .getByRole("button", { name: /continue/i })
      .click();
  }
);
