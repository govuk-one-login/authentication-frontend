import { expect } from "chai";
import { redactQueryParams } from "./logger";

describe("redactQueryParams", () => {
  [
    {
      input: undefined,
      output: undefined,
    },
    {
      input: "malformed",
      output: "malformed",
    },
    {
      input: "/authorize",
      output: "/authorize",
    },
    {
      input: "/authorize?safe=value",
      output: "/authorize?safe=value",
    },
    {
      input: "/authorize?code=secret_code&safe=value&request=long_request",
      output: "/authorize?code=hidden&safe=value&request=hidden",
    },
    {
      input: "/authorize?code=secret_code&safe=value&request=long_request",
      output: "/authorize?code=hidden&safe=value&request=hidden",
    },
  ].forEach(({ input, output }) => {
    it(`should correctly map ${input}`, () => {
      // Act
      const actual = redactQueryParams(input);

      // Assert
      expect(actual).to.equal(output);
    });
  });
});
