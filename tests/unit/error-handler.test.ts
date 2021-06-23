import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../utils/test-utils";
import { NextFunction, Request, Response } from "express";
import { pageNotFoundHandler } from "../../src/handlers/page-not-found-handler";
import { serverErrorHandler } from "../../src/handlers/internal-server-error-handler";

describe("Error handlers", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = { app: { locals: {} } } as Partial<Request>;
    res = {
      render: sandbox.spy(),
      status: sandbox.spy(),
    } as Partial<Response>;
    next = sandbox.fake();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("pageNotFoundHandler", () => {
    it("should render 404 view", () => {
      pageNotFoundHandler(req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnceWith(404);
      expect(res.render).to.have.been.calledOnceWith("common/errors/404.njk");
    });
  });

  describe("serverErrorHandler", () => {
    it("should render 500 view when csrf token is invalid", () => {
      const err: any = new Error("invalid csrf token");
      err["code"] = "EBADCSRFTOKEN";

      serverErrorHandler(err, req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnceWith(500);
      expect(res.render).to.have.been.calledOnceWith("common/errors/500.njk");
    });

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
  });
});
