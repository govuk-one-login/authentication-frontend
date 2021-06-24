import { expect } from "chai";
import { describe } from "mocha";
import { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils";
import { setHtmlLangMiddleware } from "../../../src/middleware/html-lang-middleware";

describe("HTML-lang middleware", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      i18n: { language: "en" } as any,
    };
    res = { locals: {} };
    next = sandbox.fake();
  });

  afterEach(() => {
    sandbox.restore();
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
