import { expect } from "chai";
import { describe } from "mocha";
import { NextFunction, Response } from "express";
import { sinon } from "../../utils/test-utils";
import { forceEnLanguageForSupportForms } from "../../../src/middleware/force-en-language-for-support-forms";
import { mockRequest, mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../src/app.constants";

describe("Force English Language for Support Forms", () => {
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    res = mockResponse();
    next = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("forceEnLanguageForSupportForms", () => {
    it("Should call next()", () => {
      const req = mockRequest({
        i18n: {
          language: "cy",
        },
        url: PATH_NAMES.CONTACT_US,
      });
      forceEnLanguageForSupportForms(req as any, res as Response, next);
      expect(next).to.have.been.called;
    });

    Object.values(PATH_NAMES).forEach((path) => {
      const req = mockRequest({
        i18n: {
          language: "cy",
          changeLanguage: function () {
            this.language = "en";
          },
        },
        url: path,
      });

      const re = new RegExp(`^${PATH_NAMES.CONTACT_US}`);

      if (re.test(path)) {
        it(`Should change i18n language where the path starts with '${PATH_NAMES.CONTACT_US}' (current path is: ${path})`, () => {
          forceEnLanguageForSupportForms(req as any, res as Response, next);
          expect(req.i18n.language).to.equal("en");
        });
      } else {
        it(`Should not change i18n language where the path does not start with '${PATH_NAMES.CONTACT_US}' (current path is: ${path})`, () => {
          forceEnLanguageForSupportForms(req as any, res as Response, next);
          expect(req.i18n.language).not.to.equal("en");
        });
      }
    });
  });
});
