import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "../resend-mfa-code-controller";
import { PATH_NAMES } from "../../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { SendNotificationServiceInterface } from "../../../common/send-notification/types";

describe("resend mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHECK_YOUR_PHONE,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
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
  });
});
