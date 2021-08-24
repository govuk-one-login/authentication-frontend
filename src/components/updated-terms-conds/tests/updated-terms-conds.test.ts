import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  updatedTermsCondsGet, updatedTermsCondsMandatoryGet, updatedTermsCondsOptionalGet,
  updatedTermsCondsPost,
} from "../updated-terms-conds-controller";
import { UserSession } from "../../../types";
import { UpdateTermsAndCondsServiceInterface } from "../types";

describe("share-info controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      session: { user: {} as UserSession },
      i18n: { language: "en" },
    };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake(),
      status: sandbox.fake(),
      locals: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("updatedTermsCondsGet", () => {
    it("should render updated-terms-conds page", async () => {
      const fakeService: UpdateTermsAndCondsServiceInterface = {
        updateProfile: sandbox.fake(),
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"] }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";

      await updatedTermsCondsGet(fakeService)(req as Request, res as Response);

      expect(fakeService.clientInfo).to.be.calledOnce;
      expect(res.render).to.have.calledWith("updated-terms-conds/index.njk");
    });
  });

  describe("updatedTermsCondsMandatoryGet", () => {
    it("should render updated-terms-conds-mandatory page", async () => {
      const fakeService: UpdateTermsAndCondsServiceInterface = {
        updateProfile: sandbox.fake(),
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"], serviceType: "mandatory" }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";

      await updatedTermsCondsMandatoryGet(fakeService)(req as Request, res as Response);

      expect(fakeService.clientInfo).to.be.calledOnce;
      expect(res.render).to.have.calledWith("updated-terms-conds/index-mandatory.njk");
    });
  });

  describe("updatedTermsCondsOptionalGet", () => {
    it("should render updated-terms-conds-optional page", async () => {
      const fakeService: UpdateTermsAndCondsServiceInterface = {
        updateProfile: sandbox.fake(),
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"], serviceType: "optional" }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";

      await updatedTermsCondsOptionalGet(fakeService)(req as Request, res as Response);

      expect(fakeService.clientInfo).to.be.calledOnce;
      expect(res.render).to.have.calledWith("updated-terms-conds/index-optional.njk");
    });
  });

  describe("updatedTermsCondsPost", () => {
    it("should redirect to /auth-code when acceptOrReject has value accept", async () => {
      const fakeService: UpdateTermsAndCondsServiceInterface = {
        updateProfile: sandbox.fake.returns(true),
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"] }),
      };

      req.body.acceptOrReject = "accept";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };

      await updatedTermsCondsPost(fakeService)(req as Request, res as Response);

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/auth-code");
    });
  });

  describe("updatedTermsCondsPost", () => {
    it("should redirect to redirectUri with error code param when acceptOrReject has value reject", async () => {
      const fakeService: UpdateTermsAndCondsServiceInterface = {
        updateProfile: sandbox.fake.returns(true),
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"], state: "test" }),
      };

      req.session.redirectUri = "http://test.test";
      req.body.acceptOrReject = "reject";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };
      req.session.state = "test";

      await updatedTermsCondsPost(fakeService)(req as Request, res as Response);

      expect(fakeService.updateProfile).not.to.been.called;
      expect(res.redirect).to.have.calledWith(
        "http://test.test?error_code=rejectedTermsAndConditions&state=test"
      );
    });
  });
});
