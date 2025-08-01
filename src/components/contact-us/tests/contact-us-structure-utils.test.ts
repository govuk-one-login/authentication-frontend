import { describe } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import esmock from "esmock";
import type { ContactFormStructure } from "../structure/contact-us-structure.js";

describe("contact-us-structure-utils", () => {
  describe("getThemeRadioButtonsFromContactFormStructure", () => {
    let getThemeRadioButtonsFromContactFormStructure: any;

    beforeEach(async () => {
      const mockContactUsStructure: ContactFormStructure = new Map([
        [
          "theme1",
          {
            radio: {
              mainText: "mainText1",
            },
          },
        ],
        [
          "theme2",
          {
            radio: {
              mainText: "mainText2",
            },
          },
        ],
      ]);
      const {
        getThemeRadioButtonsFromContactFormStructure:
          mockedGetThemeRadioButtons,
      } = await esmock("../structure/contact-us-structure-utils.js", {
        "../structure/contact-us-structure.js": {
          getContactFormStructure: sinon.stub().returns(mockContactUsStructure),
        },
      });
      getThemeRadioButtonsFromContactFormStructure = mockedGetThemeRadioButtons;
    });

    afterEach(async () => {
      sinon.restore();
    });

    it("should return the correct theme radio buttons", () => {
      expect(getThemeRadioButtonsFromContactFormStructure()).to.eql([
        {
          value: "theme1",
          text: "mainText1",
        },
        {
          value: "theme2",
          text: "mainText2",
        },
      ]);
    });
  });
});
