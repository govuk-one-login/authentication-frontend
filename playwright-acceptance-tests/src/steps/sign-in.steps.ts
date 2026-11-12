import { Given, When, Then } from "@cucumber/cucumber";
import { expect, expectHeading } from "../support/expect";
import type { PlaywrightWorld } from "../support/world";
import { TestUserType } from "../support/world";

import { EnterEmailPage } from "../pages/EnterEmailPage";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { CheckYourPhonePage } from "../pages/CheckYourPhonePage";
import { YouHaveOneLoginPage } from "../pages/YouHaveOneLoginPage";
import { EnterAuthenticatorAppCodePage } from "../pages/EnterAuthenticatorAppCodePage";
import { LockoutPage } from "../pages/LockoutPage";
import {
  TEST_EMAIL,
  VALID_PASSWORD,
  UK_PHONE_NUMBER,
  UK_PHONE_NUMBER_INTERNATIONAL,
} from "../support/constants";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import {
  incorrectPasswordLockoutResponse,
  incorrectPasswordResponse,
} from "../responses/login";
import { accountLockedUserExistsResponse } from "../responses/user-exists";

/* ---- Given: user setup (no-ops with stub) ---- */

Given(
  "a user with App MFA exists",
  async function (this: PlaywrightWorld): Promise<void> {
    // Sets email context to auth app user for subsequent steps
    this.testUserType = TestUserType.AUTH_APP;
  }
);

Given(
  "a user does not yet exist",
  async function (this: PlaywrightWorld): Promise<void> {
    // Use new user email so user-exists returns doesUserExist: false
    this.testUserType = TestUserType.NEW_USER;
  }
);

/* ---- Stub relying party navigation ---- */

When(
  "the user comes from the stub relying party with default options and is taken to the {string} page",
  async function (this: PlaywrightWorld, pageName: string): Promise<void> {
    const page = requirePage(this);
    const url = process.env.BASE_URL;
    if (!url) throw new Error("BASE_URL not set");
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /submit/i }).click();
    await expectHeading(page, pageName);
  }
);

When(
  "the user comes from the stub relying party with option {word} and is taken to the {string} page",
  async function (
    this: PlaywrightWorld,
    option: string,
    pageName: string
  ): Promise<void> {
    const page = requirePage(this);
    const url = process.env.BASE_URL;
    if (!url) throw new Error("BASE_URL not set");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    if (option === "2fa-off") {
      await page.locator("#level-2").click();
    } else if (option === "authenticated-2") {
      await page.locator("#authenticated-2").click();
    }

    await page.getByRole("button", { name: /submit/i }).click();
    await expectHeading(page, pageName);
  }
);

When(
  /^the user comes from the stub relying party with options: \[(.+)\] and is taken to the "(.+)" page$/,
  async function (
    this: PlaywrightWorld,
    optionsStr: string,
    pageName: string
  ): Promise<void> {
    const page = requirePage(this);
    const url = process.env.BASE_URL;
    if (!url) throw new Error("BASE_URL not set");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const options = optionsStr.split(",");
    for (const opt of options) {
      const trimmed = opt.trim();
      if (trimmed === "2fa-off") {
        await page.locator("#level-2").click();
      } else if (trimmed === "2fa-on") {
        await page.locator("#level").click();
      } else if (trimmed === "authenticated-2") {
        await page.locator("#authenticated-2").click();
      }
    }

    await page.getByRole("button", { name: /submit/i }).click();
    await expectHeading(page, pageName);
  }
);

When(
  "the user comes from the stub relying party with option {word}",
  async function (this: PlaywrightWorld, option: string): Promise<void> {
    const page = requirePage(this);
    const url = process.env.BASE_URL;
    if (!url) throw new Error("BASE_URL not set");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    if (option === "2fa-off") {
      await page.locator("#level-2").click();
    } else if (option === "authenticated-2") {
      await page.locator("#authenticated-2").click();
    }

    await page.getByRole("button", { name: /submit/i }).click();
  }
);

/* ---- Sign in / create account selection ---- */

When(
  "the user selects sign in",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    const signInBtn = page.getByRole("button", { name: /sign in/i });
    const welshBtn = page.getByRole("button", { name: /mewngofnodi/i });
    const btn = (await welshBtn.isVisible().catch(() => false))
      ? welshBtn
      : signInBtn;
    await btn.click();
  }
);

When(
  "the user selects create an account",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    const createAccountBtn = page.getByRole("button", {
      name: /create (your|a) gov\.uk one login/i,
    });
    const welshBtn = page.getByRole("button", {
      name: /creu gov\.uk one login/i,
    });
    const btn = (await welshBtn.isVisible().catch(() => false))
      ? welshBtn
      : createAccountBtn;
    await btn.click();
  }
);

/* ---- Page navigation assertions ---- */

Then(
  "the user is taken to the {string} page",
  async function (this: PlaywrightWorld, pageName: string): Promise<void> {
    const page = requirePage(this);
    const normalisedName = pageName.toLowerCase();

    switch (normalisedName) {
      case "enter your password":
        await new EnterPasswordPage(page).assertLoaded();
        break;
      case "check your phone":
        await new CheckYourPhonePage(page).assertLoaded();
        break;
      case "you have a gov.uk one login":
        await new YouHaveOneLoginPage(page).assertLoaded();
        break;
      case "enter the 6 digit security code shown in your authenticator app":
        await new EnterAuthenticatorAppCodePage(page).assertLoaded();
        break;
      default:
        await expectHeading(page, pageName);
    }
  }
);

/* ---- User actions ---- */

When(
  "the user enters their email address",
  async function (this: PlaywrightWorld): Promise<void> {
    const emailByTestUserType: Record<TestUserType, string> = {
      [TestUserType.NEW_USER]: TEST_EMAIL.NEW_USER,
      [TestUserType.PASSKEY]: TEST_EMAIL.PASSKEY_USER,
      [TestUserType.AUTH_APP]: TEST_EMAIL.AUTH_APP_USER,
      [TestUserType.SMS]: TEST_EMAIL.SMS_USER,
    };
    const email = emailByTestUserType[this.testUserType];
    const page = new EnterEmailPage(requirePage(this));
    await page.enterEmail(email);
    if (this.testUserType === TestUserType.PASSKEY) {
      await requirePage(this)
        .locator("#browserSupportsWebAuthn")
        .evaluate((el: HTMLInputElement) => (el.value = "true"));
    }
    await page.clickContinue();
  }
);

Then(
  "the user is returned to the service",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL not set");
    await page.waitForURL((url) => url.href.startsWith(baseUrl));
    await expect(page.getByText(/session id/i)).toBeVisible();
  }
);

/* ---- Registration steps ---- */

When(
  "the user chooses auth app to get security codes",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.getByRole("radio", { name: /authenticator app/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
  }
);

When(
  "the user chooses text message to get security codes",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.getByRole("radio", { name: /text message/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
  }
);

When(
  "the user enters their mobile phone number",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.locator("#phoneNumber").fill(UK_PHONE_NUMBER);
    await page.getByRole("button", { name: /continue/i }).click();
  }
);

When(
  "the user enters their mobile phone number using an international dialling code",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.locator("#phoneNumber").fill(UK_PHONE_NUMBER_INTERNATIONAL);
    await page.getByRole("button", { name: /continue/i }).click();
  }
);

When(
  "the user adds the secret key on the screen to their auth app",
  async function (this: PlaywrightWorld): Promise<void> {
    // No-op: we don't need to actually scan a QR code — we just
    // enter the valid code in the next step
  }
);

Then(
  "the user is not shown any error messages",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await expect(page.locator(".govuk-error-summary")).not.toBeVisible();
  }
);

/* ---- Lockout retry loops ---- */

When(
  "the user enters an incorrect password",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setCorrectPasswordResponse(incorrectPasswordResponse);
    await new EnterPasswordPage(requirePage(this)).enterPasswordAndContinue(
      "wrong-password"
    );
  }
);

When(
  "the user enters an incorrect password and the backend reports the password lockout limit has been reached",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setCorrectPasswordResponse(incorrectPasswordLockoutResponse);
    await new EnterPasswordPage(requirePage(this)).enterPasswordAndContinue(
      "wrong-password"
    );
  }
);

When(
  "the user enters their email address and the backend reports the account is still locked",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setUserExistsResponse(accountLockedUserExistsResponse);
    const page = new EnterEmailPage(requirePage(this));
    await page.enterEmail(TEST_EMAIL.SMS_USER);
    await page.clickContinue();
  }
);

Then(
  "the page says the user cannot sign in for 2 hours",
  async function (this: PlaywrightWorld): Promise<void> {
    await new LockoutPage(requirePage(this)).assertBodyContains(
      "You will not be able to sign in for 2 hours"
    );
  }
);

Then(
  "the page says it is because they entered the wrong password more than 5 times",
  async function (this: PlaywrightWorld): Promise<void> {
    await new LockoutPage(requirePage(this)).assertBodyContains(
      "you entered the wrong password more than 5 times"
    );
  }
);

/* ---- Lockout assertions ---- */

Then(
  "the {string} lockout screen is displayed",
  async function (this: PlaywrightWorld, heading: string): Promise<void> {
    await new LockoutPage(requirePage(this)).assertHeading(heading);
  }
);

/* ---- Welsh language ---- */

When(
  "the user switches to {string} language",
  async function (this: PlaywrightWorld, language: string): Promise<void> {
    const page = requirePage(this);
    if (language === "Welsh") {
      await page.locator("nav").getByRole("link", { name: "Cymraeg" }).click();
      const url = new URL(page.url());
      await page.context().addCookies([
        {
          name: "lng",
          value: "cy",
          domain: url.hostname,
          path: "/",
        },
      ]);
    } else {
      await page.locator("nav").getByRole("link", { name: "English" }).click();
    }
  }
);

Then(
  "the user is taken to the Identity Provider Welsh Login Page",
  async function (this: PlaywrightWorld): Promise<void> {
    await expectHeading(requirePage(this), /Creu eich GOV\.UK One/i);
  }
);

Then(
  "the user is taken to the Welsh enter your email page",
  async function (this: PlaywrightWorld): Promise<void> {
    await expectHeading(
      requirePage(this),
      /Rhowch eich cyfeiriad e-bost i fewngofnodi/i
    );
  }
);

Then(
  "the user is prompted for their password in Welsh",
  async function (this: PlaywrightWorld): Promise<void> {
    await expectHeading(requirePage(this), /Rhowch eich cyfrinair/i);
  }
);

/* ---- Continue button ---- */

When(
  "the user clicks the continue button",
  async function (this: PlaywrightWorld): Promise<void> {
    await requirePage(this)
      .getByRole("button", { name: /continue/i })
      .click();
  }
);

/* ---- Passkey registration dismissal ---- */

When(
  "the user dismisses the passkey registration page if present",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    // Wait for navigation away from the MFA code page to settle
    await page.waitForURL(/(?!.*\/enter-code)/, { timeout: 10000 });
    if (page.url().includes("/create-passkey")) {
      await page.getByRole("button", { name: /skip for now/i }).click();
    }
  }
);

/* ---- Logout ---- */

When(
  "the user clicks logout",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.context().clearCookies();
    const stubUrl = process.env.API_STUB_URL || "http://api-stub:8080";
    // Clear session auth state but preserve registration state
    await fetch(`${stubUrl}/test/state/session`, { method: "DELETE" }).catch(
      () => {}
    );
  }
);
