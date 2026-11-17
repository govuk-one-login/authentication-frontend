import type { PlaywrightWorld } from "./world";
import type { Page } from "playwright";

export function requirePage(world: PlaywrightWorld): Page {
  if (!world.page) throw new Error("Playwright page is not initialised");
  return world.page;
}
export async function endSession(page: Page): Promise<void> {
  await page.context().clearCookies();
}
