import { expect as baseExpect } from "@playwright/test";
import type { Page } from "playwright";

export const expect = baseExpect.configure({ timeout: 10_000 });

export async function expectHeading(
  page: Page,
  pageName: string | RegExp
): Promise<void> {
  await expect(page.getByRole("heading", { name: pageName })).toBeVisible();
}
