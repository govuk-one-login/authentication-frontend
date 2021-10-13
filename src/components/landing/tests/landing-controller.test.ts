import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { landingGet } from "../landing-controller";

describe("landing controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: {}, query: {} };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake(),
      locals: {},
      cookie: sandbox.fake(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("landingGet", () => {
    it("should redirect to /sign-in-or-create page", () => {
      req.session.serviceType = "MANDATORY";
      req.session.clientName = "test client name";

      landingGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/sign-in-or-create");
    });

    it("should redirect to /sign-in-or-create page with cookie preferences set", () => {
      req.query.cookie_consent = "accept";

      landingGet(req as Request, res as Response);

      expect(res.cookie).to.have.been.called;
      expect(res.redirect).to.have.calledWith("/sign-in-or-create");
    });

    it("should redirect to /uplift page when interrupt query param set", () => {
      req.query.interrupt = "UPLIFT_REQUIRED_CM";

      landingGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/uplift");
    });

    it("should redirect to /updated-terms-conditions page when interrupt query param set", () => {
      req.query.interrupt = "UPDATED_TERMS_AND_CONDITIONS";

      landingGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/updated-terms-and-conditions");
    });

    it("should redirect to /share-info page when interrupt query param set", () => {
      req.query.interrupt = "CONSENT_REQUIRED";

      landingGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/share-info");
    });
  });
});
