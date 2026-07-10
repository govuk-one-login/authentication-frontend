import { describe } from "mocha";
import { expect } from "chai";
import type {
  ContactFormStructure,
  Theme,
} from "../structure/contact-us-structure.js";
import {
  getHeaderKeyFromTheme,
  getLegendKeyFromTheme,
  getThemeRadioButtonsFromStructure,
  getTitleKeyFromTheme,
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
          mainTextKey: "mainText1",
          hintTextKey: undefined,
        },
        {
          value: "theme2",
          mainTextKey: "mainText2",
          hintTextKey: undefined,
        },
        {
          value: "theme3",
          mainTextKey: "mainText3",
          hintTextKey: "hintText3",
        },
      ]);
    });
  });

  it("should not return theme if it's hidden", () => {
    const mockContactUsStructure: ContactFormStructure = new Map([
      ["theme1", createTheme("nextPage1", "mainText1")],
      [
        "hiddenTheme1",
        createTheme(
          "hiddenNextPage2",
          "hiddenMainText2",
          undefined,
          () => true
        ),
      ],
      [
        "shownTheme1",
        createTheme("shownNextPage3", "shownMainText3", undefined, () => false),
      ],
    ]);

    expect(getThemeRadioButtonsFromStructure(mockContactUsStructure)).to.eql([
      {
        value: "theme1",
        mainTextKey: "mainText1",
        hintTextKey: undefined,
      },
      {
        value: "shownTheme1",
        mainTextKey: "shownMainText3",
        hintTextKey: undefined,
      },
    ]);
  });

  describe("getTitleFromTheme", () => {
    it("should return the correct title", () => {
      const mockSubTheme = createTheme("theme", "nextPage", "mainText");

      expect(getTitleKeyFromTheme(mockSubTheme)).to.equal("theme.title");
    });
  });

  describe("getHeaderFromTheme", () => {
    it("should return the correct title", () => {
      const mockSubTheme = createTheme("theme", "nextPage", "mainText");

      expect(getHeaderKeyFromTheme(mockSubTheme)).to.equal("theme.header");
    });
  });

  describe("getLegendFromTheme", () => {
    it("should return the correct title", () => {
      const mockSubTheme = createTheme("theme", "nextPage", "mainText");

      expect(getLegendKeyFromTheme(mockSubTheme)).to.equal(
        "theme.section1.header"
      );
    });
  });
});

const createTheme = (
  nextPageContent: string,
  mainText: string,
  hintText?: string,
  isHidden?: () => boolean
): Theme => ({
  nextPageContent: nextPageContent,
  radio: {
    mainTextKey: mainText,
    hintTextKey: hintText,
  },
  isHidden: isHidden,
});
