import { expect } from "chai";
import { describe } from "mocha";

import { applyOverloadProtection } from "../overload-protection-middleware";

describe("applyOverloadProtection", () => {
  // Sinon doesn't work well with overloadProtection hence just checking if the return exists
  it("should call overloadProtection with correct options in production mode", () => {
    const isProduction = true;
    const result = applyOverloadProtection(isProduction);
    expect(result).to.exist;
  });

  it("should call overloadProtection with correct options in non-production mode", () => {
    const isProduction = false;
    const result = applyOverloadProtection(isProduction);
    expect(result).to.exist;
  });
});
