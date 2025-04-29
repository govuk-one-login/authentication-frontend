import { expect } from "chai";
import { describe } from "mocha";
import type { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils.js";
import { setCurrentUrlMiddleware } from "../../../src/middleware/current-url-middleware.js";
import { mockRequest, mockResponse } from "mock-req-res";

describe("currentUrl middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const originalUrl = "/sign-in-or-create?lng=cy";
  const host = "signin.account.gov.uk";

  afterEach(() => {
    sinon.restore();
  });

  describe("setCurrentUrlMiddleware", () => {
    describe("where req.i18n has been set", () => {
      beforeEach(() => {
        req = mockRequest({
          originalUrl,
          get: sinon.stub().withArgs("host").returns(host),
          i18n: { language: "en" },
        });
        res = mockResponse();
        next = sinon.fake() as unknown as NextFunction;
      });

      it("should add currentUrl to request locals", () => {
        setCurrentUrlMiddleware(req as Request, res as Response, next);

        expect(res.locals).to.have.property("currentUrl");
      });

      it("currentUrl should contain the scheme, host and originalUrl", () => {
        setCurrentUrlMiddleware(req as Request, res as Response, next);
        const currentUrlAsString = String(res.locals.currentUrl);

        expect(currentUrlAsString).to.eq(`https://${host}${originalUrl}`);
      });

      it("should call next function", () => {
        setCurrentUrlMiddleware(req as Request, res as Response, next);

        expect(next).to.have.been.called;
      });
    });

    describe("where req.i18n has not been set", () => {
      before(() => {
        req = mockRequest({
          originalUrl,
          get: sinon.stub().withArgs("host").returns(host),
        });
        res = mockResponse();
        next = sinon.fake() as unknown as NextFunction;
      });

      it("should not add currentUrl to request locals", () => {
        setCurrentUrlMiddleware(req as Request, res as Response, next);

        expect(res.locals).to.not.have.property("currentUrl");
      });
    });
  });
});
