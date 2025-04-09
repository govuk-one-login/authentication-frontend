import type { NextFunction, Request, Response } from "express";
import { expect, sinon } from "../../utils/test-utils.js";
import { describe } from "mocha";
import { logErrorMiddleware } from "../../../src/middleware/log-error-middleware.js";
import { mockRequest, mockResponse } from "mock-req-res";
import { ErrorWithLevel } from "../../../src/utils/error.js";
import { ERROR_LOG_LEVEL } from "../../../src/app.constants.js";
describe("logErrorMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest({
      session: { client: {}, user: {} },
      log: { error: sinon.fake(), info: sinon.fake() },
    });
    res = mockResponse();
    next = sinon.fake() as unknown as NextFunction;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("logErrorMiddleware", () => {
    it("should log an error", () => {
      logErrorMiddleware(
        new Error("An Error"),
        req as Request,
        res as Response,
        next
      );

      expect(req.log.error).to.be.called.calledOnce;
      expect(req.log.error).to.be.called.calledWith({
        err: { data: undefined, status: undefined, stack: sinon.match.any },
        msg: "Error:An Error",
      });
      expect(next).to.be.calledOnce;
    });

    it("should log info only", () => {
      logErrorMiddleware(
        new ErrorWithLevel("Actually Info", ERROR_LOG_LEVEL.INFO),
        req as Request,
        res as Response,
        next
      );

      expect(req.log.info).to.be.called.calledOnce;
      expect(req.log.info).to.be.called.calledWith({
        err: { data: undefined, status: undefined },
        msg: "Actually Info",
      });
      expect(next).to.be.calledOnce;
    });
  });
});
