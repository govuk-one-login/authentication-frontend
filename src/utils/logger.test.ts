import { describe } from "mocha";
import { sanitiseReferer } from "./logger";
import { expect } from "chai";

describe("Referer sanitisation", () => {
  it("does not change fields other than the referer", () => {
    const beforeHeaders = {
      other: "something",
    };

    const afterHeaders = sanitiseReferer(beforeHeaders);
    expect(afterHeaders).to.deep.equals(beforeHeaders);
  });

  it("does not change referers without an email", () => {
    const beforeHeaders = {
      other: "something",
      referer:
        "https://example-referer.com/path?and=also-query%20params&email=not-an-email",
    };

    const afterHeaders = sanitiseReferer(beforeHeaders);
    expect(afterHeaders).to.deep.equals(beforeHeaders);
  });

  it("removes email from the referer", () => {
    const beforeHeaders = {
      other: "something",
      referer: "https://example-referer.com/path?a.b-cc@example.com",
    };

    const afterHeaders = sanitiseReferer(beforeHeaders);
    const expectedHeaders = {
      other: "something",
      referer: "https://example-referer.com/path?REDACTED",
    };
    expect(afterHeaders).to.deep.equals(expectedHeaders);
  });
});
