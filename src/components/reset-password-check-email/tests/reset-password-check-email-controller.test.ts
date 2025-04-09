import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import { Request, Response } from "express";

import {
  resetPasswordCheckEmailGet,
  resetPasswordCheckEmailPost,
  resetPasswordResendCodeGet,
} from "../reset-password-check-email-controller.js";
import { ResetPasswordCheckEmailServiceInterface } from "../types.js";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES } from "../../common/constants.js";
import {
  accountInterventionsFakeHelper,
  noInterventions,
} from "../../../../test/helpers/account-interventions-helpers.js";
import { fakeVerifyCodeServiceHelper } from "../../../../test/helpers/verify-code-helpers.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { getDefaultSmsMfaMethod } from "../../../utils/mfa.js";

describe("reset password check email controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL);
    res = mockResponse();
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
          data: {
            mfaMethodType: "SMS",
            phoneNumberLastThree: "123",
          },
        }),
      } as unknown as ResetPasswordCheckEmailServiceInterface;

      await resetPasswordCheckEmailGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(req.session.user.enterEmailMfaType).to.eq("SMS");
      expect(
        getDefaultSmsMfaMethod(req.session.user.mfaMethods).redactedPhoneNumber
      ).to.eq("123");

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
      const fakeInterventionsService =
        accountInterventionsFakeHelper(noInterventions);
      await resetPasswordCheckEmailPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("should redirect to check_phone if code entered is correct", async () => {
      const fakeService = fakeVerifyCodeServiceHelper(true);
      const fakeInterventionsService =
        accountInterventionsFakeHelper(noInterventions);
      req.session.user.enterEmailMfaType = "SMS";
      await resetPasswordCheckEmailPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.RESET_PASSWORD_2FA_SMS
      );
    });

    it("should redirect to check_auth_app if code entered is correct", async () => {
      const fakeService = fakeVerifyCodeServiceHelper(true);
      const fakeInterventionsService =
        accountInterventionsFakeHelper(noInterventions);
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

    it("should redirect to /reset-password without calling the account interventions service when session.user.withinForcedPasswordResetJourney === true and enterEmailMfaType == SMS", async () => {
      req.session.user.withinForcedPasswordResetJourney = true;
      req.session.user.enterEmailMfaType = "SMS";

      const fakeInterventionsService =
        accountInterventionsFakeHelper(noInterventions);

      const fakeService = fakeVerifyCodeServiceHelper(true);
      await resetPasswordCheckEmailPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.RESET_PASSWORD);
    });

    it("should redirect to /reset-password without calling the account interventions service when session.user.withinForcedPasswordResetJourney === true and enterEmailMfaType == AUTH_APP", async () => {
      req.session.user.withinForcedPasswordResetJourney = true;
      req.session.user.enterEmailMfaType = "AUTH_APP";

      const fakeInterventionsService =
        accountInterventionsFakeHelper(noInterventions);

      const fakeService = fakeVerifyCodeServiceHelper(true);
      await resetPasswordCheckEmailPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.RESET_PASSWORD);
    });
    describe("resendMfaCodeGet", () => {
      it("should render index-reset-password-resend-code.njk mfa code view", () => {
        resetPasswordResendCodeGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith(
          "reset-password-check-email/index-reset-password-resend-code.njk",
          {
            email: req.session.user.email,
          }
        );
      });
    });
  });
});
