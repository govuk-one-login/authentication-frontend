import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../utils/test-utils.js";
import { NextFunction, Request, Response } from "express";
import { pageNotFoundHandler } from "../../src/handlers/page-not-found-handler.js";
import { serverErrorHandler } from "../../src/handlers/internal-server-error-handler.js";
import { mockRequest, mockResponse } from "mock-req-res";

describe("Error handlers", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = sinon.fake() as unknown as NextFunction;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("pageNotFoundHandler", () => {
    it("should render 404 view", () => {
      pageNotFoundHandler(req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnceWith(404);
      expect(res.render).to.have.been.calledOnceWith("common/errors/404.njk");
    });
  });

  describe("serverErrorHandler", () => {
    it("should render 500 view when unexpected error", () => {
      const err = new Error("internal server error");

      serverErrorHandler(err, req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnceWith(500);
      expect(res.render).to.have.been.calledOnceWith("common/errors/500.njk");
    });

    it("should render timeout view when no session", () => {
      const err = new Error("timeout");
      res.statusCode = 401;

      serverErrorHandler(err, req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnceWith(
        "common/errors/session-expired.njk"
      );
    });

    it("should pass through the strategicAppChannel", () => {
      res.locals.strategicAppChannel = true;

      const err = new Error("timeout");
      res.statusCode = 401;

      serverErrorHandler(err, req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnceWith(
        "common/errors/session-expired.njk",
        {
          strategicAppChannel: true,
        }
      );
    });
  });
});
