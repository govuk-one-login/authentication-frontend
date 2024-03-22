import chai, { expect } from "chai";
import { Request, Response } from "express";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { validateSessionMiddleware } from "../session-middleware";
import { ERROR_MESSAGES } from "../../app.constants";

chai.use(sinonChai);

describe("Middleware", () => {
  describe("validateSessionMiddleware", () => {
    let req: Request;
    let res: Response;
    let next: sinon.SinonSpy;

    beforeEach(() => {
      req = {
        cookies: {},
        headers: {},
        session: {
          id: "session-id",
          destroy: sinon.stub().callsArg(0),
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
      next = sinon.spy();
    });

    it("should call next if all required session properties are present", () => {
      req.cookies.gs = "gs-cookie";
      req.cookies.aps = "aps-cookie";

      validateSessionMiddleware(req, res, next);

      expect(req.session.destroy).to.not.have.been.called;
      expect(res.status).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it("should destroy session and call next with error if gs cookie is missing", () => {
      req.cookies.aps = "aps-cookie";

      validateSessionMiddleware(req, res, next);

      expect(req.session).to.be(null);
      expect(res.status).to.have.been.calledOnceWith(401);
      expect(next).to.have.been.calledOnce;
      expect(next.args[0][0]).to.be.an("error");
    });

    it("should destroy session and call next with error if aps cookie is missing", () => {
      req.cookies.gs = "gs-cookie";

      validateSessionMiddleware(req, res, next);

      expect(req.session).to.be(null);
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

      expect(req.session).to.be(null);
      expect(res.status).to.have.been.calledOnceWith(401);
      expect(next).to.have.been.calledOnce;
      expect(next.args[0][0]).to.be.an("error");
    });
  });
});
