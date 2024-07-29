import { expect } from "chai";
import { describe } from "mocha";
import { redactEmail } from "../../../src/utils/email";

describe("email-helpers", () => {
  describe("redactEmail", () => {
    describe("for email prefixes of six characters or more", () => {
      const items = [
        {
          input: "abcdefghijklmnopqrstu@example.com",
          expected: "abc***@example.com",
        },
        {
          input: "fghijklmnopqrstu@example.com",
          expected: "fgh***@example.com",
        },
        {
          input: "ijklmnopqrstu@example.com",
          expected: "ijk***@example.com",
        },
        {
          input: "nopqrstu@example.com",
          expected: "nop***@example.com",
        },
        {
          input: "pqrstu@example.com",
          expected: "pqr***@example.com",
        },
      ];

      it("should show the first three characters followed by 3 asterisks", () => {
        items.map((i) => {
          expect(redactEmail(i.input)).to.equal(i.expected);
        });
      });
    });

    describe("for email prefixes of 4 or less characters", () => {
      const items = [
        {
          input: "abcd@example.com",
          expected: "TBC",
        },
        {
          input: "bcd@example.com",
          expected: "TBC",
        },
        {
          input: "cd@example.com",
          expected: "TBC",
        },
        {
          input: "d@example.com",
          expected: "TBC",
        },
      ];

      it("should REFLECT THE TBC RULES", () => {
        items.map((i) => {
          expect(redactEmail(i.input)).to.equal(i.expected);
        });
      });
    });
  });
});
