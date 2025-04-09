import { expect } from "chai";
import { describe } from "mocha";
import { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils.js";
import { setHtmlLangMiddleware } from "../../../src/middleware/html-lang-middleware.js";
import { mockRequest, mockResponse } from "mock-req-res";

describe("HTML-lang middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest({ i18n: { language: "en" } });
    res = mockResponse();
    next = sinon.fake() as unknown as NextFunction;
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
});
