import { describe } from "mocha";
import { expect } from "chai";
import { redactEmail } from "../../../src/utils/email";

describe("obscure email", () => {
  const TEST_DATA = [
    {
      fullEmail: "benjamin@hotmail.com",
      expected: "b***@hotmail.com",
    },
    {
      fullEmail: "anna@gmail.com",
      expected: "a***@gmail.com",
    },
    {
      fullEmail: "123@example.com",
      expected: "1***@example.com",
    },
    {
      fullEmail: "c@foo.gov.uk",
      expected: "c***@foo.gov.uk",
    },
  ];

  it("should return false when text entered as UK phone number", () => {
    TEST_DATA.forEach((data) =>
      expect(redactEmail(data.fullEmail)).to.equal(data.expected)
    );
  });
});
