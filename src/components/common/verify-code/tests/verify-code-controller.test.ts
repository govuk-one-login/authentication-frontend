import { expect } from "chai";
import { describe } from "mocha";

import type { Request, Response } from "express";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { fakeVerifyCodeServiceHelper } from "../../../../../test/helpers/verify-code-helpers.js";
import { verifyCodePost } from "../verify-code-controller.js";
import {
  accountInterventionsFakeHelper,
  noInterventions,
} from "../../../../../test/helpers/account-interventions-helpers.js";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../../app.constants.js";
import { ERROR_CODES, getErrorPathByCode } from "../../constants.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
import type { AccountInterventionsInterface } from "../../../account-intervention/types.js";
import sinon from "sinon";

describe("Verify code controller tests", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  let noInterventionsService: AccountInterventionsInterface;

  const EXAMPLE_REDIRECT_URI = "https://example.com/redirect";
  beforeEach(() => {
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
    noInterventionsService = accountInterventionsFakeHelper(noInterventions);
    res = mockResponse();
  });

  afterEach(() => {
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
  });

  describe("verify email notification type", () => {
    const verifyCodePostOptions = {
      notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
      template: "check-your-email/index.njk",
      validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
      validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
    };

    it("if code is valid and NOTIFICATION_TYPE.EMAIL_CODE redirects to /enter-password without calling account interventions", async () => {
      const verifyCodeService = fakeVerifyCodeServiceHelper(true);

      req = createMockRequest(PATH_NAMES.ENTER_PASSWORD);
      req.session.user = { email: "test@test.com" };

      await verifyCodePost(
        verifyCodeService,
        noInterventionsService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(noInterventionsService.accountInterventionStatus).to.not.be.called;

      expect(res.redirect).to.have.calledWith("/enter-password");
    });

    it("if code is invalid and too many email opt codes entered during registration redirect to /security-code-invalid without calling account interventions", async () => {
      const verifyCodeService = fakeVerifyCodeServiceHelper(
        false,
        ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES
      );

      req = createMockRequest(PATH_NAMES.CHECK_YOUR_EMAIL);
      req.session.user = {
        email: "test@test.com",
        isAccountCreationJourney: true,
      };

      await verifyCodePost(
        verifyCodeService,
        noInterventionsService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(noInterventionsService.accountInterventionStatus).to.not.be.called;

      expect(res.redirect).to.have.calledWith(
        getErrorPathByCode(
          ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES
        )
      );
    });

    it("should render error when notificationType is RESET_PASSWORD_WITH_CODE and MFA_CODE_REQUESTS_BLOCKED error is returned", async () => {
      const verifyCodeService = fakeVerifyCodeServiceHelper(
        false,
        ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED
      );

      req = createMockRequest(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL);
      req.session.user = {
        email: "test@test.com",
      };

      await verifyCodePost(verifyCodeService, noInterventionsService, {
        ...verifyCodePostOptions,
        notificationType: NOTIFICATION_TYPE.RESET_PASSWORD_WITH_CODE,
      })(req as Request, res as Response);

      expect(res.render).to.have.calledOnceWithExactly(
        "security-code-error/index-wait.njk"
      );
    });

    it("should render error when notificationType is RESET_PASSWORD_WITH_CODE and ENTERED_INVALID_MFA_MAX_TIMES error is returned", async () => {
      const verifyCodeService = fakeVerifyCodeServiceHelper(
        false,
        ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES
      );

      req = createMockRequest(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL);
      req.session.user = {
        email: "test@test.com",
      };

      await verifyCodePost(verifyCodeService, noInterventionsService, {
        ...verifyCodePostOptions,
        notificationType: NOTIFICATION_TYPE.RESET_PASSWORD_WITH_CODE,
      })(req as Request, res as Response);

      expect(res.render).to.have.calledOnceWithExactly(
        "security-code-error/index-security-code-entered-exceeded.njk",
        { show2HrScreen: true }
      );
    });
  });

  describe("When code is valid and NOTIFICATION_TYPE.MFA_SMS", () => {
    const verifyCodeService = fakeVerifyCodeServiceHelper(true);
    const verifyCodePostOptions = {
      notificationType: NOTIFICATION_TYPE.MFA_SMS,
      template: "check-your-email/index.njk",
      validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
      validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
      journeyType: JOURNEY_TYPE.PASSWORD_RESET_MFA,
    };
    beforeEach(() => {
      req = createMockRequest(PATH_NAMES.RESET_PASSWORD_2FA_SMS);
      req.session.user = { email: "test@test.com" };
    });

    it("if account has no AIS status, redirects to reset password", async () => {
      await verifyCodePost(
        verifyCodeService,
        noInterventionsService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(noInterventionsService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("if account has only temporary suspension status, redirects to /unavailable-temporary", async () => {
      const accountInterventionService = accountInterventionsFakeHelper({
        temporarilySuspended: true,
        blocked: false,
        passwordResetRequired: false,
        reproveIdentity: false,
      });
      await verifyCodePost(
        verifyCodeService,
        accountInterventionService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/unavailable-temporary");
    });

    it("if account has only permanent suspension status, redirects to /unavailable-permanent", async () => {
      const accountInterventionService = accountInterventionsFakeHelper({
        blocked: true,
        passwordResetRequired: false,
        temporarilySuspended: false,
        reproveIdentity: false,
      });
      await verifyCodePost(
        verifyCodeService,
        accountInterventionService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/unavailable-permanent");
    });

    it("if account has reset password and suspended status, redirects to reset password", async () => {
      const accountInterventionService = accountInterventionsFakeHelper({
        passwordResetRequired: true,
        temporarilySuspended: true,
        blocked: false,
        reproveIdentity: false,
      });
      await verifyCodePost(
        verifyCodeService,
        accountInterventionService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/reset-password");
    });
  });

  describe("Reauth log out scenarios", async () => {
    beforeEach(() => {
      req = createMockRequest(PATH_NAMES.ENTER_MFA);
      req.session.user = {
        email: "test@test.com",
        isAccountCreationJourney: false,
        reauthenticate: "123456",
      };
      req.session.client = {
        redirectUri: EXAMPLE_REDIRECT_URI,
      };
      process.env.SUPPORT_REAUTHENTICATION = "1";
    });
    const verifyCodePostOptions = {
      notificationType: NOTIFICATION_TYPE.MFA_SMS,
      template: "enter-mfa/index.njk",
      validationKey: "pages.enterMfa.code.validationError.invalidCode",
      validationErrorCode: ERROR_CODES.INVALID_MFA_CODE,
      journeyType: JOURNEY_TYPE.REAUTHENTICATION,
    };

    it("should redirect to logged out if reauth is enabled and user entered too many invalid codes", async () => {
      const verifyCodeService = fakeVerifyCodeServiceHelper(
        false,
        ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES
      );

      await verifyCodePost(
        verifyCodeService,
        noInterventionsService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(noInterventionsService.accountInterventionStatus).to.not.be.called;

      expect(res.redirect).to.have.calledWith(
        EXAMPLE_REDIRECT_URI.concat("?error=login_required")
      );
    });

    it("should redirect to logged out if reauth is enabled and user entered too many invalid reauth details", async () => {
      const verifyCodeService = fakeVerifyCodeServiceHelper(
        false,
        ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED
      );

      await verifyCodePost(
        verifyCodeService,
        noInterventionsService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(noInterventionsService.accountInterventionStatus).to.not.be.called;

      expect(res.redirect).to.have.calledWith(
        EXAMPLE_REDIRECT_URI.concat("?error=login_required")
      );
    });
  });

  describe("callback option", () => {
    async function testCallbackOption(callbackValue: boolean) {
      const verifyCodeService = fakeVerifyCodeServiceHelper(true);
      const callback = sinon.fake(() => Promise.resolve(callbackValue));

      req = createMockRequest(PATH_NAMES.ENTER_PASSWORD);
      req.session.user = { email: "test@test.com" };

      await verifyCodePost(verifyCodeService, noInterventionsService, {
        notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
        template: "check-your-email/index.njk",
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
        beforeSuccessRedirectCallback: callback,
      })(req as Request, res as Response);
      return callback;
    }

    it("executes the callback option and returns early if true is returned", async () => {
      const callback = await testCallbackOption(true);
      expect(callback).to.be.called;
      expect(res.redirect).to.not.have.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });

    it("executes the callback option and continue if false is returned", async () => {
      const callback = await testCallbackOption(false);
      expect(callback).to.be.called;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });
  });
});
