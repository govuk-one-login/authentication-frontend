import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { shareInfoGet, shareInfoPost } from "../share-info-controller";
import { UserSession } from "../../../types";
import { ShareInfoServiceInterface } from "../types";

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

  describe("shareInfoGet", () => {
    it("should render share-info page", async () => {
      const fakeService: ShareInfoServiceInterface = {
        updateProfile: sandbox.fake(),
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"] }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";

      await shareInfoGet(fakeService)(req as Request, res as Response);

      expect(fakeService.clientInfo).to.be.calledOnce;
      expect(res.render).to.have.calledWith("share-info/index.njk");
    });
  });

  describe("shareInfoPost", () => {
    it("should redirect to /auth-code when succesfully", async () => {
      const fakeService: ShareInfoServiceInterface = {
        updateProfile: sandbox.fake.returns(true),
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"] }),
      };

      req.body.consentValue = true;
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };

      await shareInfoPost(fakeService)(req as Request, res as Response);

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/auth-code");
    });
  });

  describe("shareInfoPostError", () => {
    it("should throw error when update profile returns false", async () => {
      const fakeService: ShareInfoServiceInterface = {
        updateProfile: sandbox.fake.returns(false),
        clientInfo: sandbox.fake.returns({ scopes: ["openid", "profile"] }),
      };

      req.body.consentValue = true;
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };

      await expect(
        shareInfoPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Unable to update user profile");

      expect(fakeService.updateProfile).to.have.been.calledOnce;
    });
  });
});
