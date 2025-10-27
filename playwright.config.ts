import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  workers: 10,
  testDir: "./test",
  testMatch: "**/*.snapshot.test.ts",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },
  ],
  use: {
    baseURL: process.env?.WEBSITE_HOST || "http://localhost:3000",
    headless: true,
  },
});
