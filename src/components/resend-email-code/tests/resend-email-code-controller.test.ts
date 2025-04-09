import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import { Request, Response } from "express";

import {
  resendEmailCodePost,
  resendEmailCodeGet,
  securityCodeCheckTimeLimit,
} from "../resend-email-code-controller.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { SendNotificationServiceInterface } from "../../common/send-notification/types.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("resend email controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_EMAIL);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resendEmailCodeGet", () => {
    it("should render resend email code view", () => {
      resendEmailCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("resend-email-code/index.njk");
    });
  });

  describe("resendEmailCodePost", () => {
    it("should send email code and redirect to /check-your-email view", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SendNotificationServiceInterface;

      req.session.user = {
        email: "test@test.com",
      };
      req.path = PATH_NAMES.RESEND_EMAIL_CODE;

      await resendEmailCodePost(fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.CHECK_YOUR_EMAIL);
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
    });

    it("should remove session flag for email registration soft block due to incorrect retries", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SendNotificationServiceInterface;

      req.session.user = {
        email: "test@test.com",
        isVerifyEmailCodeResendRequired: true,
        isAccountCreationJourney: true,
      };
      req.path = PATH_NAMES.RESEND_EMAIL_CODE;

      await resendEmailCodePost(fakeNotificationService)(
        req as Request,
        res as Response
      );
      expect(req.session.user.isVerifyEmailCodeResendRequired).to.be.undefined;
      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.CHECK_YOUR_EMAIL);
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
    });
  });

  describe("securityCodeCheckTimeLimit", () => {
    it("should render security-code-error/index-wait.njk if codeRequestLock is set in the future", async () => {
      req.session.user = {
        email: "test@test.com",
        codeRequestLock: new Date(Date.now() + 15 * 60000).toUTCString(),
      };
      req.path = PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;

      await securityCodeCheckTimeLimit()(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith(
        "security-code-error/index-wait.njk",
        {
          newCodeLink: "/security-code-check-time-limit",
        }
      );
    });

    it("should redirect to /resend-email-code if codeRequestLock is set in the past", async () => {
      req.session.user = {
        email: "test@test.com",
        codeRequestLock: new Date(Date.now() - 15 * 60000).toUTCString(),
      };
      req.path = PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;

      await securityCodeCheckTimeLimit()(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith("/resend-email-code");
    });

    it("should redirect to /resend-email-code if codeRequestLock is not set", async () => {
      req.session.user = {
        email: "test@test.com",
      };
      req.path = PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;

      await securityCodeCheckTimeLimit()(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith("/resend-email-code");
    });
  });
});
