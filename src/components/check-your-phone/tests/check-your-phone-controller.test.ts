import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  checkYourPhoneGet,
  checkYourPhonePost,
} from "../check-your-phone-controller";

import { VerifyCodeInterface } from "../../common/verify-code/types";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";

describe("check your phone controller", () => {
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

  describe("checkYourPhoneGet", () => {
    it("should render check your phone view", () => {
      checkYourPhoneGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("check-your-phone/index.njk");
    });
  });

  describe("checkYourPhonePost", () => {
    it("should redirect to /create-password when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns({
          sessionState: "PHONE_NUMBER_CODE_VERIFIED",
          success: true,
        }),
      };

      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sandbox.fake(),
      };

      req.body.code = "123456";
      res.locals.sessionId = "123456-djjad";

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/account-created");
    });

    it("should return error when invalid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns({
          success: false,
          sessionState: "PHONE_NUMBER_CODE_NOT_VALID",
        }),
      };
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sandbox.fake(),
      };

      req.t = sandbox.fake.returns("translated string");
      req.body.code = "678988";
      res.locals.sessionId = "123456-djjad";

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith("check-your-phone/index.njk");
    });

    it("should redirect to security code expired when invalid code entered more than max retries", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns({
          sessionState: "PHONE_NUMBER_CODE_MAX_RETRIES_REACHED",
          success: false,
        }),
      };

      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sandbox.fake(),
      };

      req.t = sandbox.fake.returns("translated string");
      req.body.code = "678988";
      res.locals.sessionId = "123456-djjad";

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith("/security-code-invalid");
    });

    it("should update the user session state value in the req", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sandbox.fake.returns({
          success: true,
          sessionState: "CONSENT_REQUIRED",
        }),
      };

      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sandbox.fake(),
      };

      expect(req.session.backState).to.be.undefined;

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(req.session.backState).to.equal("CONSENT_REQUIRED");
    });
  });
});
