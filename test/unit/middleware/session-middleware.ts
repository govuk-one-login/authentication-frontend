import { NextFunction, Request, Response } from "express";
import { expect, sinon } from "../../utils/test-utils";
import { describe } from "mocha";
import {
  getSessionIdMiddleware, handleBackButtonMiddleware,
  initialiseSessionMiddleware,
  validateSessionMiddleware,
} from "../../../src/middleware/session-middleware";
import {PATH_NAMES, USER_STATE} from "../../../src/app.constants";

describe("session-middleware", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {} as any,
      cookies: {} as any,
    };
    res = { status: sandbox.stub(), locals: {}, redirect: sandbox.fake()};
    next = sandbox.fake();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createSessionMiddleware", () => {
    it("should create an empty session", () => {
      initialiseSessionMiddleware(req as Request, res as Response, next);

      expect(req.session).to.have.property("user");
      expect(next).to.be.calledOnce;
    });
  });

  describe("getSessionIdMiddleware", () => {
    it("should add session id to response when cookie present", () => {
      req.cookies = { gs: "tsIAHDy103zhcxbQq0" };
      getSessionIdMiddleware(req as Request, res as Response, next);

      expect(res.locals).to.have.property("sessionId");
      expect(next).to.be.calledOnce;
    });
    it("should not have session id on response when no session cookie present", () => {
      req.cookies = undefined;

      getSessionIdMiddleware(req as Request, res as Response, next);

      expect(res.locals).is.empty;
      expect(next).to.be.calledOnce;
    });
  });

  describe("validateSessionMiddleware", () => {
    it("should call next when valid session", () => {
      req.cookies = { gs: "tsIAHDy103zhcxbQq0", aps: "eyJ1c2VyIjp7fX0" };
      res.locals.sessionId = "sdam$$LLDD";
      validateSessionMiddleware(req as Request, res as Response, next);

      expect(next).to.be.called;
    });

    it("should call next with error when invalid session", () => {
      validateSessionMiddleware(req as Request, res as Response, next);

      expect(res.status).to.be.called.calledWith(401);
      expect(next).to.be.called;
    });
  });

  describe("handleBackButtonMiddleware", () => {
    it("should call next when session state is missing", () => {
      req.session = {
        backState: null
      };
      handleBackButtonMiddleware(req as Request, res as Response, next);

      expect(next).to.be.called;
    });

    it("should call next when the next path matches the current request path", () => {
      req.session = {
        backState: USER_STATE.LOGGED_IN
      };
      req.route = {
        path: PATH_NAMES.ENTER_MFA
      };

      handleBackButtonMiddleware(req as Request, res as Response, next);

      expect(next).to.be.called;
    });

    it("should redirect to invalid session error page if next path does not match current request path", () => {
      req.session = {
        backState: USER_STATE.LOGGED_IN
      };
      req.route = {
        path: "/incorrect-path"
      };

      handleBackButtonMiddleware(req as Request, res as Response, next);
      expect(req.session.backState).to.be.null;
      expect(res.redirect).to.be.calledWith("/invalid-session");
    });
  });
});
