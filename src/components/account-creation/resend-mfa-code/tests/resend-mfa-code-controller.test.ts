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
import { commonVariables } from "../../../../../test/helpers/common-test-variables";

describe("resend mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  const { sessionId, clientSessionId, diPersistentSessionId, ip, email } =
    commonVariables;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_PHONE);
    req.ip = ip;
    res = mockResponse();
    res.locals.sessionId = sessionId;
    res.locals.clientSessionId = clientSessionId;
    res.locals.persistentSessionId = diPersistentSessionId;
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

      req.session.user = {
        email,
        isAccountRecoveryJourney: true,
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION;
      await resendMfaCodePost(fakeService)(req as Request, res as Response);
      expect(fakeService.sendNotification).to.have.been.calledWith(
        sessionId,
        clientSessionId,
        email,
        "VERIFY_PHONE_NUMBER",
        ip,
        diPersistentSessionId,
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

      req.session.user = {
        email,
        isAccountCreationJourney: true,
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION;
      await resendMfaCodePost(fakeService)(req as Request, res as Response);
      expect(fakeService.sendNotification).to.have.been.calledWith(
        sessionId,
        clientSessionId,
        email,
        "VERIFY_PHONE_NUMBER",
        ip,
        diPersistentSessionId,
        "",
        req,
        "REGISTRATION"
      );
    });
  });
});
