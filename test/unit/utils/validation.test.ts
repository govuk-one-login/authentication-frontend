import { expect } from "chai";
import { describe } from "mocha";
import {
  replaceErrorMessagePlaceholders,
  deDuplicateErrorList,
} from "../../../src/utils/validation.js";
import { PLACEHOLDER_REPLACEMENTS } from "../../../src/app.constants.js";
describe("validation", () => {
  describe("replaceErrorMessagePlaceholders", () => {
    it("should make all replacements", () => {
      const errorsWithPlaceholders = [
        {
          text: "What happened must be [maximumCharacters] characters or less",
          href: "#issueDescription",
        },
      ];

      const expected = [
        {
          text: "What happened must be 1,200 characters or less",
          href: "#issueDescription",
        },
      ];

      expect(
        replaceErrorMessagePlaceholders(
          errorsWithPlaceholders,
          PLACEHOLDER_REPLACEMENTS
        )
      ).to.eql(expected);
    });
  });

  describe("deDuplicateErrorList", () => {
    it("should remove duplicates", () => {
      const initialErrorList = {
        serviceTryingToUse: {
          text: "Enter the name of the service",
          href: "#serviceTryingToUse",
        },
        serviceWhereIssueWasEncountered: {
          text: "Enter the name of the service",
          href: "#serviceTryingToUse",
        },
        contact: {
          text: "Select yes if we can reply to you by email",
          href: "#contact",
        },
      };

      const expected = [
        {
          text: "Enter the name of the service",
          href: "#serviceTryingToUse",
        },
        {
          text: "Select yes if we can reply to you by email",
          href: "#contact",
        },
      ];

      expect(deDuplicateErrorList(initialErrorList)).to.eql(expected);
    });
  });
});
