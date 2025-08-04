import { describe } from "mocha";
import { expect } from "chai";
import type {
  ContactFormStructure,
  Theme,
} from "../structure/contact-us-structure.js";
import {
  getHeaderFromTheme, getLegendFromTheme,
  getThemeRadioButtonsFromStructure,
  getTitleFromTheme,
} from "../structure/contact-us-structure-utils.js";

describe("contact-us-structure-utils", () => {
  describe("getThemeRadioButtonsFromContactFormStructure", () => {
    it("should return the correct theme radio buttons", () => {
      const mockContactUsStructure: ContactFormStructure = new Map([
        ["theme1", createTheme("nextPage1", "mainText1")],
        ["theme2", createTheme("nextPage2", "mainText2")],
        ["theme3", createTheme("nextPage3", "mainText3", "hintText3")],
      ]);

      expect(getThemeRadioButtonsFromStructure(mockContactUsStructure)).to.eql([
        {
          value: "theme1",
          mainText: "mainText1",
          hintText: undefined,
        },
        {
          value: "theme2",
          mainText: "mainText2",
          hintText: undefined,
        },
        {
          value: "theme3",
          mainText: "mainText3",
          hintText: "hintText3",
        },
      ]);
    });
  });

  describe("getTitleFromTheme", () => {
    it("should return the correct title", () => {
      const mockSubTheme = createTheme("theme", "nextPage", "mainText");

      expect(getTitleFromTheme(mockSubTheme)).to.equal("theme.title");
    });
  });

  describe("getHeaderFromTheme", () => {
    it("should return the correct title", () => {
      const mockSubTheme = createTheme("theme", "nextPage", "mainText");

      expect(getHeaderFromTheme(mockSubTheme)).to.equal("theme.header");
    });
  });

  describe("getLegendFromTheme", () => {
    it("should return the correct title", () => {
      const mockSubTheme = createTheme("theme", "nextPage", "mainText");

      expect(getLegendFromTheme(mockSubTheme)).to.equal("theme.section1.header");
    });
  });
});

const createTheme = (
  nextPageContent: string,
  mainText: string,
  hintText?: string
): Theme => ({
  nextPageContent: nextPageContent,
  radio: {
    mainText,
    hintText,
  },
});
