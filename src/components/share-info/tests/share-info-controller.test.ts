import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { shareInfoGet, shareInfoPost } from "../share-info-controller";

import { ClientInfoServiceInterface } from "../../common/client-info/types";
import { BadRequestError } from "../../../utils/error";
import { UpdateProfileServiceInterface } from "../../common/update-profile/types";

describe("share-info controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      session: {},
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
      const fakeClientInfoService: ClientInfoServiceInterface = {
        clientInfo: sandbox.fake.returns({
          data: { scopes: ["openid", "profile"] },
          success: true,
        }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";

      await shareInfoGet(fakeClientInfoService)(
        req as Request,
        res as Response
      );

      expect(fakeClientInfoService.clientInfo).to.be.calledOnce;
      expect(res.render).to.have.calledWith("share-info/index.njk");
    });
  });

  describe("shareInfoPost", () => {
    it("should redirect to /auth-code when accepted sharing info", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake.returns({
          success: true,
          sessionState: "CONSENT_ADDED",
        }),
      };

      req.body.consentValue = true;
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.email = "test@test.com";

      await shareInfoPost(fakeService)(req as Request, res as Response);

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/auth-code");
    });
  });

  describe("shareInfoPostError", () => {
    it("should throw error when update profile returns false", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake.returns({
          success: false,
          code: "1000",
          message: "error",
        }),
      };

      req.body.consentValue = true;
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.email = "test@test.com";

      await expect(
        shareInfoPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(BadRequestError, "1000:error");

      expect(fakeService.updateProfile).to.have.been.calledOnce;
    });
  });
});
