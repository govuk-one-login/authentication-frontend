import { Given, When, Then } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";

import { StubStartPage } from "../pages/StubStartPage";
import { CreateOrSignInPage } from "../pages/CreateOrSignInPage";
import { EnterEmailPage } from "../pages/EnterEmailPage";

/* -----------------------------------------
   Helper functions to load strongly-typed pages
------------------------------------------ */

function getStubStartPage(world: PlaywrightWorld): StubStartPage {
  if (!world.page) throw new Error("Playwright page is not initialised");
  return new StubStartPage(world.page);
}

function getCreateOrSignInPage(world: PlaywrightWorld): CreateOrSignInPage {
  if (!world.page) throw new Error("Playwright page is not initialised");
  return new CreateOrSignInPage(world.page);
}

function getEnterEmailPage(world: PlaywrightWorld): EnterEmailPage {
  if (!world.page) throw new Error("Playwright page is not initialised");
  return new EnterEmailPage(world.page);
}

/* -----------------------------------------
   Stub → Create-or-sign-in page
------------------------------------------ */

Given(
  "I open the orchestration stub start page",
  async function (this: PlaywrightWorld): Promise<void> {
    await getStubStartPage(this).open();
  }
);

Given(
  "I select the default stub options",
  async function (this: PlaywrightWorld): Promise<void> {
    await getStubStartPage(this).selectDefaultOptions();
  }
);

When(
  "I submit the stub form",
  async function (this: PlaywrightWorld): Promise<void> {
    await getStubStartPage(this).submit();
  }
);

Then(
  "I should see the Create your GOV.UK One Login or sign in page",
  async function (this: PlaywrightWorld): Promise<void> {
    await getCreateOrSignInPage(this).assertLoaded();
  }
);

/* -----------------------------------------
   Create-or-sign-in → Enter email page
------------------------------------------ */

Then(
  "I click on Sign in button",
  async function (this: PlaywrightWorld): Promise<void> {
    await getCreateOrSignInPage(this).clickSignIn();
  }
);

Then(
  'I am taken to the "enter your email" page',
  async function (this: PlaywrightWorld): Promise<void> {
    await getEnterEmailPage(this).assertLoaded();
  }
);
