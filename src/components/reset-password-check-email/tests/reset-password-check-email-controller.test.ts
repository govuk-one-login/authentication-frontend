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
import { PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { accountInterventionsFakeHelper } from "../../../../test/helpers/account-interventions-helpers";
import { fakeVerifyCodeServiceHelper } from "../../../../test/helpers/verify-code-helpers";

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
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
    req.session.user = {
      email: "joe.bloggs@test.com",
    };
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
  });

  describe("resetPasswordCheckEmailGet", () => {
    it("should render reset password check email view", async () => {
      const fakeService: ResetPasswordCheckEmailServiceInterface = {
        resetPasswordRequest: sinon.fake.returns({
          success: true,
        }),
      } as unknown as ResetPasswordCheckEmailServiceInterface;

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
    beforeEach(() => {
      req.body.code = "123456";
      req.session.id = "123456-djjad";
    });
    it("should redirect to reset password if code entered is correct", async () => {
      const fakeService = fakeVerifyCodeServiceHelper(true);
      const fakeInterventionsService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        false,
        false
      );
      await resetPasswordCheckEmailPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("should redirect to check_phone if code entered is correct and feature flag is turned on", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
      const fakeService = fakeVerifyCodeServiceHelper(true);
      const fakeInterventionsService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        false,
        false
      );
      req.session.user.enterEmailMfaType = "SMS";
      await resetPasswordCheckEmailPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.RESET_PASSWORD_2FA_SMS
      );
    });

    it("should redirect to check_auth_app if code entered is correct and feature flag is turned on", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
      const fakeService = fakeVerifyCodeServiceHelper(true);
      const fakeInterventionsService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        false,
        false
      );
      req.session.user.enterEmailMfaType = "AUTH_APP";
      await resetPasswordCheckEmailPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP
      );
    });

    it("should render check email page with errors if incorrect code entered", async () => {
      const fakeService = fakeVerifyCodeServiceHelper(
        false,
        ERROR_CODES.RESET_PASSWORD_INVALID_CODE
      );
      await resetPasswordCheckEmailPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "reset-password-check-email/index.njk"
      );
    });

    it("should redirect to /reset-password without calling the account interventions service when session.user.withinForcedPasswordResetJourney === true", async () => {
      req.session.user.withinForcedPasswordResetJourney = true;
      const fakeService = fakeVerifyCodeServiceHelper(true);
      await resetPasswordCheckEmailPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.RESET_PASSWORD);
    });
  });
});
