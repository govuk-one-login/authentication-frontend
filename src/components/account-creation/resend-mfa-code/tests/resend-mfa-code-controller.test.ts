import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "../resend-mfa-code-controller";
import { PATH_NAMES } from "../../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { SendNotificationServiceInterface } from "../../../common/send-notification/types";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";

describe("resend mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_PHONE);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resendMfaCodeGet", () => {
    it("should render resend mfa code view", () => {
      resendMfaCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "account-creation/resend-mfa-code/index.njk"
      );
    });
  });

  describe("resendMfaCodePost", () => {
    it("should request new phone verification code from send notification service and if successful redirect to /enter-code view", async () => {
      const fakeService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SendNotificationServiceInterface;

      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION;

      await resendMfaCodePost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.CHECK_YOUR_PHONE);
      expect(fakeService.sendNotification).to.have.been.calledOnce;
    });

    it("should request new phone verification code from send notification service and if successful redirect to /enter-code view", async () => {
      const fakeService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SendNotificationServiceInterface;
      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "654321-djjad";
      res.locals.persistentSessionId = "123123-djjad";

      req.session.user = {
        email: "test@test.com",
        isAccountRecoveryJourney: true,
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION;
      req.ip = "127.0.0.1";
      await resendMfaCodePost(fakeService)(req as Request, res as Response);
      expect(fakeService.sendNotification).to.have.been.calledWith(
        "123456-djjad",
        "654321-djjad",
        "test@test.com",
        "VERIFY_PHONE_NUMBER",
        "127.0.0.1",
        "123123-djjad",
        "",
        req,
        "ACCOUNT_RECOVERY"
      );
    });

    it("should request new phone verification code from send notification service and if successful redirect to /enter-code view", async () => {
      const fakeService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SendNotificationServiceInterface;
      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "654321-djjad";
      res.locals.persistentSessionId = "123123-djjad";

      req.session.user = {
        email: "test@test.com",
        isAccountCreationJourney: true,
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION;
      req.ip = "127.0.0.1";
      await resendMfaCodePost(fakeService)(req as Request, res as Response);
      expect(fakeService.sendNotification).to.have.been.calledWith(
        "123456-djjad",
        "654321-djjad",
        "test@test.com",
        "VERIFY_PHONE_NUMBER",
        "127.0.0.1",
        "123123-djjad",
        "",
        req,
        "REGISTRATION"
      );
    });
  });
});
