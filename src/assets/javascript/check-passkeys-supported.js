/* global SimpleWebAuthnBrowser */
document.addEventListener("DOMContentLoaded", () => {
  if (SimpleWebAuthnBrowser.browserSupportsWebAuthn()) {
    const browserSupportsWebAuthnEl = document.getElementById(
      "browserSupportsWebAuthn"
    );
    browserSupportsWebAuthnEl.value = "true";
  }
});
