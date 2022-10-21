import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  resendEmailCodePost,
  resendEmailCodeGet,
  securityCodeCheckTimeLimit,
} from "../resend-email-code-controller";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";

describe("resend email controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHECK_YOUR_EMAIL,
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
      };

      res.locals.sessionId = "123456-djjad";
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
  });

  describe("securityCodeCheckTimeLimit", () => {
    it("should render security-code-error/index-wait.njk if `sendNotificationResponse.success` is false", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: false,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };
      req.path = PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;

      await securityCodeCheckTimeLimit(fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith(
        "security-code-error/index-wait.njk"
      );
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
    });

    it("should redirect to /resend-email-code if `sendNotificationResponse.success` is true", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };
      req.path = PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;

      await securityCodeCheckTimeLimit(fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith("/resend-email-code");
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
    });
  });
});
