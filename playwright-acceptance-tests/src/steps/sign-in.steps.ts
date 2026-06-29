import { Given, When, Then } from "@cucumber/cucumber";
import { expect, expectHeading } from "../support/expect";
import type { PlaywrightWorld } from "../support/world";
import { TestUserType } from "../support/world";

import { EnterEmailPage } from "../pages/EnterEmailPage";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { CheckYourPhonePage } from "../pages/CheckYourPhonePage";
import { YouHaveOneLoginPage } from "../pages/YouHaveOneLoginPage";
import { TEST_EMAIL, VALID_PASSWORD } from "../support/constants";

function requirePage(world: PlaywrightWorld) {
  if (!world.page) throw new Error("Playwright page is not initialised");
  return world.page;
}

/* ---- Given: user setup (no-ops with stub) ---- */

Given("a user exists", async function (this: PlaywrightWorld): Promise<void> {
  // No-op: API stub always behaves as if user exists
});

Given(
  "a user with SMS MFA exists",
  async function (this: PlaywrightWorld): Promise<void> {
    // No-op: API stub default user has SMS MFA
  }
);

Given(
  "a user exists with a passkey",
  async function (this: PlaywrightWorld): Promise<void> {
    // Sets email context to passkey user for subsequent steps
    this.testUserType = TestUserType.PASSKEY;
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
    await requirePage(this)
      .getByRole("button", { name: /create your gov\.uk one login/i })
      .click();
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
      default:
        await expectHeading(page, pageName);
    }
  }
);

/* ---- User actions ---- */

When(
  "the user enters their email address",
  async function (this: PlaywrightWorld): Promise<void> {
    const email =
      this.testUserType === TestUserType.PASSKEY
        ? TEST_EMAIL.PASSKEY_USER
        : TEST_EMAIL.SMS_USER;
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

When(
  "the user enters their password",
  async function (this: PlaywrightWorld): Promise<void> {
    await new EnterPasswordPage(requirePage(this)).enterPasswordAndContinue(
      VALID_PASSWORD
    );
  }
);

When(
  "the user enters the six digit security code from their phone",
  async function (this: PlaywrightWorld): Promise<void> {
    await new CheckYourPhonePage(requirePage(this)).enterCodeAndContinue(
      "123456"
    );
  }
);

Then(
  "the user is returned to the service",
  async function (this: PlaywrightWorld): Promise<void> {
    await expect(requirePage(this).getByText(/session id/i)).toBeVisible({
      timeout: 15_000,
    });
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

When(
  "the user enters their email address in Welsh",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.getByRole("textbox").fill(TEST_EMAIL.SMS_USER);
    await page.getByRole("button", { name: /parhau/i }).click();
  }
);

Then(
  "the user is prompted for their password in Welsh",
  async function (this: PlaywrightWorld): Promise<void> {
    await expectHeading(requirePage(this), /Rhowch eich cyfrinair/i);
  }
);

When(
  "the user clicks link {string}",
  async function (this: PlaywrightWorld, linkText: string): Promise<void> {
    await requirePage(this).getByRole("link", { name: linkText }).click();
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
