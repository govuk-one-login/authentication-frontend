import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  resetPasswordCheckEmailGet,
  resetPasswordCheckEmailPost,
} from "../reset-password-check-email-controller";
import { ResetPasswordCheckEmailServiceInterface } from "../types";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { VerifyCodeInterface } from "../../common/verify-code/types";
import { PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { accountInterventionsFakeHelper } from "../../../../test/helpers/account-interventions-helpers";

describe("reset password check email controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
    res.locals.sessionId = "s-123456-djjad";
    process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "0";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPasswordCheckEmailGet", () => {
    it("should render reset password check email view", async () => {
      const fakeService: ResetPasswordCheckEmailServiceInterface = {
        resetPasswordRequest: sinon.fake.returns({
          success: true,
        }),
      } as unknown as ResetPasswordCheckEmailServiceInterface;

      req.session.user = {
        email: "joe.bloggs@test.com",
      };

      await resetPasswordCheckEmailGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "reset-password-check-email/index.njk"
      );
    });
  });

  describe("resetPasswordCheckEmailPost", () => {
    it("should redirect to reset password if code entered is correct", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body.code = "123456";
      req.session.id = "123456-djjad";
      await resetPasswordCheckEmailPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("should redirect to check_phone if code entered is correct and feature flag is turned on", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.session.user.enterEmailMfaType = "SMS";
      req.body.code = "123456";
      req.session.id = "123456-djjad";
      await resetPasswordCheckEmailPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.RESET_PASSWORD_2FA_SMS
      );
    });

    it("should redirect to check_auth_app if code entered is correct and feature flag is turned on", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.session.user.enterEmailMfaType = "AUTH_APP";
      req.body.code = "123456";
      req.session.id = "123456-djjad";
      await resetPasswordCheckEmailPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP
      );
    });

    it("should render check email page with errors if incorrect code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.RESET_PASSWORD_INVALID_CODE,
          },
        }),
      } as unknown as VerifyCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body.code = "123456";
      req.session.id = "123456-djjad";

      await resetPasswordCheckEmailPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "reset-password-check-email/index.njk"
      );
    });

    it("should redirect to /password-reset-required when temporarilySuspended and passwordResetRequired statuses applied to users account and they try to reset their password", async () => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";

      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      const fakeInterventionsService = accountInterventionsFakeHelper(
        "test@test.com",
        true,
        false,
        true
      );
      req.body.code = "123456";
      req.session.id = "123456-djjad";

      await resetPasswordCheckEmailPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.PASSWORD_RESET_REQUIRED
      );
    });
  });
});
