import { expect } from "chai";
import { describe } from "mocha";
import { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils";
import { setHtmlLangMiddleware } from "../../../src/middleware/html-lang-middleware";
import { mockRequest, mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../src/app.constants";

describe("HTML-lang middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest({ i18n: { language: "en" } });
    res = mockResponse();
    next = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("setHtmlLangMiddleware", () => {
    it("should add language to request locals", () => {
      setHtmlLangMiddleware(req as Request, res as Response, next);

      expect(res.locals).to.have.property("htmlLang");
      expect(next).to.have.been.called;
    });

    it("should call next function", () => {
      req = {};

      setHtmlLangMiddleware(req as Request, res as Response, next);

      expect(res.locals).to.not.have.property("htmlLang");
      expect(next).to.have.been.called;
    });
  });

  describe("setHtmlLangMiddleware on support forms", () => {
    Object.values(PATH_NAMES).forEach((path) => {
      const req = mockRequest({
        i18n: {
          language: "cy",
        },
        url: path,
      });

      const re = new RegExp(`^${PATH_NAMES.CONTACT_US}`);

      if (re.test(path)) {
        it(`should change i18n language where the path starts with '${PATH_NAMES.CONTACT_US}' (current path is: ${path})`, () => {
          setHtmlLangMiddleware(req as any, res as Response, next);
          expect(res.locals.htmlLang).to.equal("en");
        });
      } else {
        it(`should not change i18n language where the path does not start with '${PATH_NAMES.CONTACT_US}' (current path is: ${path})`, () => {
          setHtmlLangMiddleware(req as any, res as Response, next);
          expect(res.locals.htmlLang).not.to.equal("en");
        });
      }
    });
  });
});
