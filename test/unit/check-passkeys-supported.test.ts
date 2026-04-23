import { describe, it } from "mocha";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import { expect } from "chai";

const scriptContent = fs.readFileSync(
  path.join(process.cwd(), "src/assets/javascript/check-passkeys-supported.js"),
  "utf-8"
);

describe("check-passkeys-supported", () => {
  function setup(mockBrowserSupportsWebAuthnVal: boolean) {
    const dom = new JSDOM(
      `<!DOCTYPE html>
      <html>
        <body>
          <form>
            <input type="hidden" name="browserSupportsWebAuthn" id="browserSupportsWebAuthn" value="false"/>
          </form>
          <script>
            var SimpleWebAuthnBrowser = {
              browserSupportsWebAuthn: function() { return ${mockBrowserSupportsWebAuthnVal}; }
            };
          </script>
          <script>${scriptContent}</script>
        </body>
      </html>`,
      { runScripts: "dangerously", url: "http://localhost" }
    );

    const domContentLoaded = new Promise<void>((resolve) => {
      dom.window.document.addEventListener("DOMContentLoaded", () => resolve());
      setTimeout(resolve, 0);
    });

    return {
      document: dom.window.document,
      domContentLoaded: domContentLoaded,
    };
  }

  it("should set browserSupportsWebAuthn to true if api supported", async () => {
    const { document, domContentLoaded } = setup(true);
    await domContentLoaded;

    const input = document.getElementById(
      "browserSupportsWebAuthn"
    ) as HTMLInputElement;
    expect(input.value).to.eq("true");
  });

  it("should not set browserSupportsWebAuthn to true if api not supported", async () => {
    const { document, domContentLoaded } = setup(false);
    await domContentLoaded;

    const input = document.getElementById(
      "browserSupportsWebAuthn"
    ) as HTMLInputElement;
    expect(input.value).to.eq("false");
  });
});
