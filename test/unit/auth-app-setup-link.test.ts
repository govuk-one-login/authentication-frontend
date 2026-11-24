import { describe, it } from "mocha";
import { expect } from "chai";
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "fs";
import path from "path";

const scriptContent = fs.readFileSync(
  path.join(process.cwd(), "src/assets/javascript/auth-app-setup-link.js"),
  "utf-8"
);

describe("auth-app-setup-link", () => {
  function setup(html: string) {
    const navigationAttempts: string[] = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("jsdomError", (error: Error) => {
      if (error.message.includes("navigation")) {
        navigationAttempts.push(error.message);
      }
    });

    const dom = new JSDOM(
      `<!DOCTYPE html><html><body>${html}<script>${scriptContent}</script></body></html>`,
      { runScripts: "dangerously", url: "http://localhost/", virtualConsole }
    );

    return { document: dom.window.document, navigationAttempts };
  }

  it("should not navigate until the button is clicked", () => {
    const { navigationAttempts } = setup(`
      <button id="auth-app-setup-button" type="button" data-auth-app-setup-link="otpauth://totp/test?secret=TESTSECRET">Open</button>
    `);

    expect(navigationAttempts).to.have.length(0);
  });

  it("should navigate to the link on the button when it is clicked", () => {
    const { document, navigationAttempts } = setup(`
      <button id="auth-app-setup-button" type="button" data-auth-app-setup-link="otpauth://totp/test?secret=TESTSECRET">Open</button>
    `);

    (
      document.getElementById("auth-app-setup-button") as HTMLButtonElement
    ).click();

    expect(navigationAttempts).to.have.length(1);
  });

  it("should not navigate when the button has no link", () => {
    const { document, navigationAttempts } = setup(`
      <button id="auth-app-setup-button" type="button">Open</button>
    `);

    (
      document.getElementById("auth-app-setup-button") as HTMLButtonElement
    ).click();

    expect(navigationAttempts).to.have.length(0);
  });

  it("should do nothing when the page has no button", () => {
    expect(() => setup(`<p>No button</p>`)).to.not.throw();
  });
});
