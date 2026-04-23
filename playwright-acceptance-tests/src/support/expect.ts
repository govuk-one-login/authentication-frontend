import { expect as baseExpect } from "@playwright/test";

export const expect = baseExpect.configure({ timeout: 10_000 });
