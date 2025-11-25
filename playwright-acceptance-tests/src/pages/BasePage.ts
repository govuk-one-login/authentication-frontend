import { Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: "networkidle" });
  }

  async assertBasicSecurity() {
    if ((process.env.SECURITY_CHECK || "true").toLowerCase() !== "true") return;

    const url = this.page.url();

    if (!url.startsWith("https://")) {
      throw new Error(`Expected HTTPS URL, got: ${url}`);
    }

    const isSecureContext = await this.page.evaluate(() => window.isSecureContext);
    if (!isSecureContext) {
      throw new Error("Expected secure context (window.isSecureContext === true)");
    }
  }

  async runAccessibilityCheck() {
    if ((process.env.A11Y_CHECK || "true").toLowerCase() !== "true") return;

    const results = await new AxeBuilder({ page: this.page }).analyze();
    const violations = results.violations || [];

    if (violations.length === 0) {
      console.log("A11y: no accessibility violations found.");
      return;
    }

    const message = violations
      .map((v) => {
        const impact = v.impact ? v.impact.toUpperCase() : "UNKNOWN";
        const header = `[${impact}] ${v.id} – ${v.help}`;
        const helpUrl = v.helpUrl ? `  Help: ${v.helpUrl}` : "";

        const nodes = v.nodes.slice(0, 3).map((n, index) => {
          const target = n.target ? n.target.join(" ") : "";
          const html = (n.html || "").replace(/\s+/g, " ").trim();
          return `  Node ${index + 1}:\n    Target: ${target}\n    HTML: ${html}`;
        });

        const extra =
          v.nodes.length > 3
            ? `  ...and ${v.nodes.length - 3} more node(s)`
            : "";

        return [header, helpUrl, ...nodes, extra].filter(Boolean).join("\n");
      })
      .join("\n\n----------------------------------------\n\n");

    throw new Error(
      `Accessibility violations (${violations.length}):\n\n${message}`
    );
  }
}
