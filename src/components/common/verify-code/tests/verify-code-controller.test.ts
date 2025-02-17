import { expect } from "chai";
import { describe } from "mocha";

import { Request, Response } from "express";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { fakeVerifyCodeServiceHelper } from "../../../../../test/helpers/verify-code-helpers";
import { verifyCodePost } from "../verify-code-controller";
import {
  accountInterventionsFakeHelper,
  noInterventions,
} from "../../../../../test/helpers/account-interventions-helpers";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../../app.constants";
import { ERROR_CODES, getErrorPathByCode } from "../../constants";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";
import { AccountInterventionsInterface } from "../../../account-intervention/types";
import { getPermittedJourneyForPath } from "../../../../utils/session";

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
      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_PASSWORD),
        email: "test@test.com",
      };

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
        journey: getPermittedJourneyForPath(PATH_NAMES.CHECK_YOUR_EMAIL),
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
  });

  describe("When code is valid and NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES and code is valid", () => {
    const verifyCodeService = fakeVerifyCodeServiceHelper(true);
    const verifyCodePostOptions = {
      notificationType: NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
      template: "check-your-email/index.njk",
      validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
      validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
    };
    beforeEach(() => {
      req = createMockRequest(
        PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES
      );
      req.session.user = {
        journey: getPermittedJourneyForPath(
          PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES
        ),
        email: "test@test.com",
      };
    });

    it("if account is blocked, redirects to /unavailable-permanent", async () => {
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

    it("if account is temporarily suspended only, redirects to /unavailable-temporary", async () => {
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

    it("if account has has password reset required status, redirects to /password-reset-required", async () => {
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
      expect(res.redirect).to.have.calledWith("/password-reset-required");
    });

    it("if account has reprove identity and suspended status, redirects to /get-security-codes", async () => {
      const accountInterventionService = accountInterventionsFakeHelper({
        passwordResetRequired: false,
        temporarilySuspended: true,
        blocked: false,
        reproveIdentity: true,
      });
      await verifyCodePost(
        verifyCodeService,
        accountInterventionService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.GET_SECURITY_CODES);
    });

    it("if account has no AIS status, redirects to /get-security-codes", async () => {
      await verifyCodePost(
        verifyCodeService,
        noInterventionsService,
        verifyCodePostOptions
      )(req as Request, res as Response);

      expect(noInterventionsService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/get-security-codes");
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
      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.RESET_PASSWORD_2FA_SMS),
        email: "test@test.com",
      };
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
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
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
});
