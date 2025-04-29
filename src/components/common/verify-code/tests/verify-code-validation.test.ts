import { expect } from "chai";
import { describe } from "mocha";
import { removeWhiteSpace } from "../verify-code-validation.js";
describe("removeWhiteSpace", () => {
  it("should return the provided string if it is just 6 digits", () => {
    const input = "123456";

    expect(removeWhiteSpace(input)).to.equal(input);
  });

  it("should not return the provided string if it is not 6 digits", () => {
    const input = "123 456";

    expect(removeWhiteSpace(input)).to.not.equal(input);
  });

  it("should strip whitespace wherever it appears in the given value", () => {
    const items = [
      { input: " 123456", expected: "123456" },
      { input: "1 23456", expected: "123456" },
      { input: "12 3456", expected: "123456" },
      { input: "123 456", expected: "123456" },
      { input: "1234 56", expected: "123456" },
      { input: "12345 6", expected: "123456" },
      { input: "123456 ", expected: "123456" },
    ];

    items.forEach((i) => {
      expect(removeWhiteSpace(i.input)).to.equal(i.expected);
    });
  });

  it("should strip repeated whitespace wherever it appears in the given value", () => {
    const items = [
      { input: "   123456", expected: "123456" },
      { input: "1   23456", expected: "123456" },
      { input: "12   3456", expected: "123456" },
      { input: "123   456", expected: "123456" },
      { input: "1234   56", expected: "123456" },
      { input: "12345   6", expected: "123456" },
      { input: "123456   ", expected: "123456" },
    ];

    items.forEach((i) => {
      expect(removeWhiteSpace(i.input)).to.equal(i.expected);
    });
  });

  it("should strip multiple instances of repeated whitespace wherever it appears", () => {
    const items = [
      { input: "   123456   ", expected: "123456" },
      { input: "1   2345   6", expected: "123456" },
      { input: "12   34   56", expected: "123456" },
      { input: "123   456", expected: "123456" },
      { input: "123   4   56", expected: "123456" },
      { input: "12   345   6", expected: "123456" },
      { input: "1   23456   ", expected: "123456" },
    ];

    items.forEach((i) => {
      expect(removeWhiteSpace(i.input)).to.equal(i.expected);
    });
  });

  it("should strip different types of whitespace", () => {
    const items = [
      { input: "   123456   ", expected: "123456" },
      { input: "1\v23\n4 5\t6 ", expected: "123456" },
      { input: "\r123\n4 5\t6 ", expected: "123456" },
      { input: "\r1\v234 5\t6 ", expected: "123456" },
      { input: "\r1\v23\n4 56 ", expected: "123456" },
      { input: "\r1234 5\t6\f ", expected: "123456" },
      { input: "\r1234 5\t6 ", expected: "123456" },
    ];

    items.forEach((i) => {
      expect(removeWhiteSpace(i.input)).to.equal(i.expected);
    });
  });
});
