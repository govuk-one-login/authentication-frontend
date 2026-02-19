import chai, { expect } from "chai";
import type { Request, Response } from "express";
import type { Session } from "express-session";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import {
  getSessionIdMiddleware,
  initialiseSessionMiddleware,
  requiredSessionFieldsMiddleware,
  sessionIsValid,
  validateSessionMiddleware,
} from "../session-middleware.js";
import {
  ERROR_MESSAGES,
  JOURNEY_TYPE,
  PATH_NAMES,
} from "../../app.constants.js";
import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";
import { buildMfaMethods } from "../../../test/helpers/mfa-helper";
import { createMockRequest } from "../../../test/helpers/mock-request-helper.js";

chai.use(sinonChai);

describe("session-middleware", () => {
  let next: sinon.SinonSpy;
  let req: Request;
  let res: Response;

  describe("initialiseSessionMiddleware", () => {
    beforeEach(() => {
      req = createMockRequest(PATH_NAMES.SIGN_IN_OR_CREATE);
      res = mockResponse();
      next = sinon.fake();
    });

    it("should create an empty session", () => {
      initialiseSessionMiddleware(req as Request, res as Response, next);

      expect(req.session).to.have.property("user");
      expect(next).to.be.calledOnce;
    });

    it("should carry over some existing session data when visiting AUTHORIZE", () => {
      const activeMfaMethodId = "auth-app-id";
      const mfaMethods = buildMfaMethods([
        { id: activeMfaMethodId, authApp: true },
      ]);
      req.session.user = {
        // To be ignored
        isAuthenticated: false,
        journey: JOURNEY_TYPE.SIGN_IN,

        // To be brought over
        email: "email@example.com",
        mfaMethods,
        activeMfaMethodId,
      };
      req.path = PATH_NAMES.AUTHORIZE;
      initialiseSessionMiddleware(req as Request, res as Response, next);

      expect(req.session).to.have.property("user");
      expect(req.session.user).to.be.deep.equal({
        email: "email@example.com",
        mfaMethods,
        activeMfaMethodId,
      });
    });

    it("should handle a missing session", () => {
      req.session = {} as Session;

      initialiseSessionMiddleware(req, res, next);

      expect(next).to.be.calledOnce;
    });
  });

  describe("getSessionIdMiddleware", () => {
    beforeEach(() => {
      req = mockRequest({ session: { client: {}, user: {} } });
      res = mockResponse();
      next = sinon.fake();
    });
    it("should add session id to response when cookie present", () => {
      req.cookies = { gs: "tsIAHDy103zhcxbQq0" };
      getSessionIdMiddleware(req as Request, res as Response, next);

      expect(res.locals).to.have.property("sessionId");
      expect(res.locals).to.not.have.property("persistentSessionId");
      expect(next).to.be.calledOnce;
    });
    it("should add persistent session id to locals when cookie present", () => {
      req.cookies = { "di-persistent-session-id": "psid123456xyz" };
      getSessionIdMiddleware(req as Request, res as Response, next);

      expect(res.locals).to.have.property("persistentSessionId");
      expect(res.locals.persistentSessionId).to.equal("psid123456xyz");
      expect(next).to.be.calledOnce;
    });
    it("should not have session id on response when no session cookie present", () => {
      req.cookies = undefined;

      getSessionIdMiddleware(req as Request, res as Response, next);

      expect(res.locals).is.empty;
      expect(next).to.be.calledOnce;
    });
  });

  describe("sessionIsValid", () => {
    beforeEach(() => {
      req = {
        session: {
          id: "session-id",
          sessionRestored: true,
        },
        cookies: {
          gs: "gs-cookie",
          aps: "aps-cookie",
        },
      } as any;
    });

    it("should return true when session is valid", () => {
      const result = sessionIsValid(req as Request);

      expect(result).to.equal(true);
    });

    it("should return false when cookies are missing", async () => {
      delete req.cookies;

      const result = sessionIsValid(req as Request);

      expect(result).to.equal(false);
    });

    it("should return false when gs cookie is missing", async () => {
      delete req.cookies.gs;

      const result = sessionIsValid(req as Request);

      expect(result).to.equal(false);
    });

    it("should return false when aps cookie is missing", async () => {
      delete req.cookies.aps;

      const result = sessionIsValid(req as Request);

      expect(result).to.equal(false);
    });

    it("should return false when the session is missing", async () => {
      delete req.session;

      const result = sessionIsValid(req as Request);

      expect(result).to.equal(false);
    });

    it("should return false when the session ID is missing", async () => {
      delete req.session.id;

      const result = sessionIsValid(req as Request);

      expect(result).to.equal(false);
    });
  });

  const setupSession = () => {
    req = {
      cookies: {},
      headers: {},
      session: {
        id: "session-id",
        destroy: sinon.stub().callsArg(0),
        user: {},
      },
      log: {
        error: sinon.stub(),
        info: sinon.stub(),
      },
      get: function (headerName: string) {
        if (headerName === "Referrer") {
          return this.headers["referer"] || this.headers["referrer"];
        }
      },
    } as any;
    res = {
      locals: {},
      status: sinon.stub().returns({
        json: sinon.stub(),
      }),
    } as any;
    next = sinon.fake();
  };

  describe("requiredSessionFieldsMiddleware", () => {
    beforeEach(setupSession);

    it("should call next if email present on session", () => {
      req.session.user.email = "email@email";

      requiredSessionFieldsMiddleware(req, res, next);

      expect(req.session.destroy).to.not.have.been.called;
      expect(res.status).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it("should destroy session and call next with error if email missing from session", () => {
      requiredSessionFieldsMiddleware(req, res, next);

      expect(req.session.destroy).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(401);
      expect(next).to.have.been.calledOnce;
      expect(next.args[0][0]).to.be.an("error");
    });
  });

  describe("validateSessionMiddleware", () => {
    beforeEach(setupSession);

    it("should call next if all required session properties are present", () => {
      req.cookies.gs = "gs-cookie";
      req.cookies.aps = "aps-cookie";
      req.session.sessionRestored = true;

      validateSessionMiddleware(req, res, next);

      expect(req.session.destroy).to.not.have.been.called;
      expect(res.status).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it("should destroy session and call next with error if gs cookie is missing", () => {
      req.cookies.aps = "aps-cookie";

      validateSessionMiddleware(req, res, next);

      expect(req.session.destroy).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(401);
      expect(next).to.have.been.calledOnce;
      expect(next.args[0][0]).to.be.an("error");
    });

    it("should destroy session and call next with error if aps cookie is missing", () => {
      req.cookies.gs = "gs-cookie";

      validateSessionMiddleware(req, res, next);

      expect(req.session.destroy).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(401);
      expect(next).to.have.been.calledOnce;
      expect(next.args[0][0]).to.be.an("error");
    });

    it("should destroy session and call next with error if sessionRestored is missing", () => {
      req.cookies.gs = "gs-cookie";
      req.cookies.aps = "aps-cookie";

      validateSessionMiddleware(req, res, next);

      expect(req.session.destroy).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(401);
      expect(next).to.have.been.calledOnce;
      expect(next.args[0][0]).to.be.an("error");
    });

    it("should recognise non gov.uk referer", () => {
      req.headers.referer = "test.external.bookmark.com";

      validateSessionMiddleware(req, res, next);

      expect(next.getCalls()[0].args[0].message).to.eq(
        ERROR_MESSAGES.INVALID_SESSION_NON_GOV_UK_EXTERNAL_REQUEST
      );
    });

    it("should recognise internal (gov.uk) referer", () => {
      req.headers.referer = "localhost.test.gov.uk";

      validateSessionMiddleware(req, res, next);

      expect(next.getCalls()[0].args[0].message).to.eq(
        ERROR_MESSAGES.INVALID_SESSION_GOV_UK_INTERNAL_REQUEST
      );
    });

    it("should destroy session and call next with error if session id is missing", () => {
      req.cookies.gs = "gs-cookie";
      req.cookies.aps = "aps-cookie";
      req.session.id = null;

      validateSessionMiddleware(req, res, next);

      expect(req.session.destroy).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(401);
      expect(next).to.have.been.calledOnce;
      expect(next.args[0][0]).to.be.an("error");
    });
  });
});
