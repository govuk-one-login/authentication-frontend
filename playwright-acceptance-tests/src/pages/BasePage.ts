import type { Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { expect } from "../support/expect";

type AxeNodeLite = {
  target?: string[];
  html?: string;
};

type AxeViolationLite = {
  id?: string;
  help?: string;
  helpUrl?: string;
  impact?: string | null;
  nodes?: AxeNodeLite[];
};

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async assertLoaded(pageName: string | RegExp): Promise<void> {
    await expect(
      this.page.getByRole("heading", {
        name: pageName,
      })
    ).toBeVisible();

    await this.runAccessibilityCheck();
  }

  async clickContinue(): Promise<void> {
    await this.page.getByRole("button", { name: /continue/i }).click();
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async runAccessibilityCheck(): Promise<void> {
    if ((process.env.A11Y_CHECK || "true").toLowerCase() !== "true") {
      return;
    }

    const builder = new AxeBuilder({ page: this.page as any });

    const rawResults = await builder.analyze();
    const violations = (rawResults.violations ?? []) as AxeViolationLite[];

    if (violations.length === 0) {
      return;
    }

    const message = violations
      .map((v) => {
        const impact = v.impact?.toUpperCase() ?? "UNKNOWN";
        const header = `[${impact}] ${v.id ?? "unknown-id"} – ${
          v.help ?? "No description"
        }`;
        const helpUrl = v.helpUrl ? `  Help: ${v.helpUrl}` : "";

        const nodes = (v.nodes ?? [])
          .slice(0, 3)
          .map((n: AxeNodeLite, index: number) => {
            const target = n.target?.join(" ") ?? "";
            const html = (n.html ?? "").replace(/\s+/g, " ").trim();
            return `  Node ${index + 1}:\n    Target: ${target}\n    HTML: ${html}`;
          });

        const extra =
          (v.nodes?.length ?? 0) > 3
            ? `  ...and ${(v.nodes?.length ?? 0) - 3} more node(s)`
            : "";

        return [header, helpUrl, ...nodes, extra].filter(Boolean).join("\n");
      })
      .join("\n\n----------------------------------------\n\n");

    throw new Error(
      `Accessibility violations (${violations.length}):\n\n${message}`
    );
  }
}
