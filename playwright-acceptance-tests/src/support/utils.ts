import type { PlaywrightWorld } from "./world";
import type { Page } from "playwright";

export function requirePage(world: PlaywrightWorld): Page {
  if (!world.page) throw new Error("Playwright page is not initialised");
  return world.page;
}
export async function endSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  const stubUrl = process.env.API_STUB_URL || "http://api-stub:8080";
  const url = `${stubUrl}/test/state/session`;

  let res: Response;
  try {
    res = await fetch(url, { method: "DELETE" });
  } catch (cause) {
    throw new Error(
      `Failed to reach stub to end session (DELETE ${url}): ${String(cause)}`
    );
  }
  if (!res.ok) {
    throw new Error(
      `Failed to end session: DELETE ${url} returned ${res.status}`
    );
  }
}
