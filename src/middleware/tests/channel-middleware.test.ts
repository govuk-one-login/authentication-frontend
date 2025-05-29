import chai, { expect } from "chai";
import type { Request, Response } from "express";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { channelMiddleware } from "../channel-middleware.js";
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

    it("should set strategicAppChannel and isApp to true for strategic app clients", () => {
      const req = mockRequest({
        session: { client: {}, user: { channel: "strategic_app" } },
      });
      channelMiddleware(req as Request, res as Response, next);

      expect(res.locals.strategicAppChannel).to.equal(true);
      expect(res.locals.webChannel).to.equal(false);
      expect(res.locals.genericAppChannel).to.equal(false);
      expect(res.locals.isApp).to.equal(true);
      expect(next).to.be.calledOnce;
    });

    it("should set webChannel to true for web clients", () => {
      const req = mockRequest({ session: { client: {}, user: { channel: "web" } } });
      channelMiddleware(req as Request, res as Response, next);

      expect(res.locals.strategicAppChannel).to.equal(false);
      expect(res.locals.webChannel).to.equal(true);
      expect(res.locals.genericAppChannel).to.equal(false);
      expect(res.locals.isApp).to.equal(false);
      expect(next).to.be.calledOnce;
    });

    it("should set generic-app and isApp to true for generic-app clients", () => {
      const req = mockRequest({
        session: { client: {}, user: { channel: "generic_app" } },
      });
      channelMiddleware(req as Request, res as Response, next);

      expect(res.locals.strategicAppChannel).to.equal(false);
      expect(res.locals.webChannel).to.equal(false);
      expect(res.locals.genericAppChannel).to.equal(true);
      expect(res.locals.isApp).to.equal(true);
      expect(next).to.be.calledOnce;
    });

    it("should set no channel to true if provided an unrecognised channel", () => {
      const req = mockRequest({ session: { client: {}, user: { channel: "unknown" } } });
      channelMiddleware(req as Request, res as Response, next);

      expect(res.locals.strategicAppChannel).to.equal(false);
      expect(res.locals.webChannel).to.equal(false);
      expect(next).to.be.calledOnce;
    });

    describe("fallback behaviour", () => {
      // it("should use 'session' channel if provided")
      // already tested above
      // see 'should set strategicAppChannel to true for strategic app clients'

      it("should use 'channel' cookie if 'session' is not provided", () => {
        const req = mockRequest({ cookies: { channel: "strategic_app" } });

        channelMiddleware(req as Request, res as Response, next);

        expect(res.locals.strategicAppChannel).to.equal(true);
        expect(res.locals.webChannel).to.equal(false);
        expect(res.locals.genericAppChannel).to.equal(false);
        expect(next).to.be.calledOnce;
      });

      it("should use default channel if no cookie is provided", () => {
        const req = mockRequest();

        channelMiddleware(req as Request, res as Response, next);

        expect(res.locals.strategicAppChannel).to.equal(false);
        expect(res.locals.webChannel).to.equal(true);
        expect(res.locals.genericAppChannel).to.equal(false);
        expect(next).to.be.calledOnce;
      });
    });
  });
});
