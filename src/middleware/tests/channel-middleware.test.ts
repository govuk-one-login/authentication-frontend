import chai, { expect } from "chai";
import { Request, Response } from "express";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { channelMiddleware } from "../channel-middleware";
import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";

chai.use(sinonChai);

describe("session-middleware", () => {
  let next: sinon.SinonSpy;
  let res: Response;

  describe("createSessionMiddleware", () => {
    beforeEach(() => {
      res = mockResponse();
      next = sinon.fake();
    });

    it("should set strategicAppChannel to true for strategic app clients", () => {
      const req = mockRequest({
        session: { client: {}, user: { channel: "strategic_app" } },
      });
      channelMiddleware(req as Request, res as Response, next);

      expect(res.locals.strategicAppChannel).to.equal(true);
      expect(res.locals.webChannel).to.equal(false);
      expect(next).to.be.calledOnce;
    });

    it("should set webChannel to true for web clients", () => {
      const req = mockRequest({
        session: { client: {}, user: { channel: "web" } },
      });
      channelMiddleware(req as Request, res as Response, next);

      expect(res.locals.strategicAppChannel).to.equal(false);
      expect(res.locals.webChannel).to.equal(true);
      expect(next).to.be.calledOnce;
    });

    it("should set no channel to true if provided an unrecognised channel", () => {
      const req = mockRequest({
        session: { client: {}, user: { channel: "unknown" } },
      });
      channelMiddleware(req as Request, res as Response, next);

      expect(res.locals.strategicAppChannel).to.equal(false);
      expect(res.locals.webChannel).to.equal(false);
      expect(next).to.be.calledOnce;
    });
  });
});