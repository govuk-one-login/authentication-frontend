import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import { resendMfaCodeGet, resendMfaCodePost } from "../resend-mfa-code-controller.js";
import { PATH_NAMES } from "../../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import type { SendNotificationServiceInterface } from "../../../common/send-notification/types.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../../test/helpers/common-test-variables.js";
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

      expect(res.render).to.have.calledWith("account-creation/resend-mfa-code/index.njk");
    });
  });

  describe("resendMfaCodePost", () => {
    let fakeService: SendNotificationServiceInterface;

    beforeEach(() => {
      fakeService = {
        sendNotification: sinon.fake.returns(
          Promise.resolve({ success: true, data: { message: "", code: 200 } })
        ),
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION;
    });

    it("should request new phone verification code from send notification service and if successful redirect to /enter-code view", async () => {
      await resendMfaCodePost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.CHECK_YOUR_PHONE);
      expect(fakeService.sendNotification).to.have.been.calledOnce;
    });

    it("should request new phone verification code with relevant registration journey type for account recovery journey", async () => {
      req.session.user = {
        email,
        isAccountRecoveryJourney: true,
      };
      const expectedJourneyType = "ACCOUNT_RECOVERY";

      await resendMfaCodePost(fakeService)(req as Request, res as Response);

      expect(fakeService.sendNotification).to.have.been.calledWith(
        sessionId,
        clientSessionId,
        email,
        "VERIFY_PHONE_NUMBER",
        diPersistentSessionId,
        "",
        req,
        expectedJourneyType
      );
    });

    it("should request new phone verification code with relevant registration journey type for account creation journey", async () => {
      req.session.user = {
        email,
        isAccountCreationJourney: true,
      };
      const expectedJourneyType = "REGISTRATION";

      await resendMfaCodePost(fakeService)(req as Request, res as Response);

      expect(fakeService.sendNotification).to.have.been.calledWith(
        sessionId,
        clientSessionId,
        email,
        "VERIFY_PHONE_NUMBER",
        diPersistentSessionId,
        "",
        req,
        expectedJourneyType
      );
    });
  });
});
