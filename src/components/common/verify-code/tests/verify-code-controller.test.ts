import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../../test/utils/test-utils";

import { Request, Response } from "express";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { fakeVerifyCodeServiceHelper } from "../../../../../test/helpers/verify-code-helpers";
import { verifyCodePost } from "../verify-code-controller";
import { accountInterventionsFakeHelper } from "../../../../../test/helpers/account-interventions-helpers";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../../app.constants";
import { ERROR_CODES } from "../../constants";

describe("Verify code controller tests", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";

    res = mockResponse();
  });

  afterEach(() => {
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
  });

  it("if code is valid and NOTIFICATION_TYPE.EMAIL_CODE redirects to /enter-password without calling account interventions", async () => {
    const verifyCodeService = fakeVerifyCodeServiceHelper(true);
    const accountInterventionService = accountInterventionsFakeHelper(
      "test@test.com",
      false,
      false,
      false
    );

    req = mockRequest({
      path: PATH_NAMES.ENTER_PASSWORD,
      session: { client: {}, user: { email: "test@test.com" } },
      log: { info: sinon.fake() },
    });

    await verifyCodePost(verifyCodeService, accountInterventionService, {
      notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
      template: "check-your-email/index.njk",
      validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
      validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
    })(req as Request, res as Response);

    expect(accountInterventionService.accountInterventionStatus).to.not.be
      .called;

    expect(res.redirect).to.have.calledWith("/enter-password");
  });

  describe("When code is valid and NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES and code is valid", () => {
    const verifyCodeService = fakeVerifyCodeServiceHelper(true);
    beforeEach(() => {
      req = mockRequest({
        path: PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
        session: { client: {}, user: { email: "test@test.com" } },
        log: { info: sinon.fake() },
      });
    })

    it("if account is blocked, redirects to /unavailable-permanent", async () => {
      const accountInterventionService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        true,
        false
      );
      await verifyCodePost(verifyCodeService, accountInterventionService, {
        notificationType:
          NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
        template: "check-your-email/index.njk",
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
      })(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/unavailable-permanent");
    });

    it("if account is temporarily suspended only, redirects to /unavailable-temporary", async () => {
      const accountInterventionService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        false,
        true
      );
      await verifyCodePost(verifyCodeService, accountInterventionService, {
        notificationType:
          NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
        template: "check-your-email/index.njk",
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
      })(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/unavailable-temporary");
    });

    it("if account has has password reset required status, redirects to /password-reset-required", async () => {
      const accountInterventionService = accountInterventionsFakeHelper(
        "test@test.com",
        true,
        false,
        true
      );
      await verifyCodePost(verifyCodeService, accountInterventionService, {
        notificationType:
          NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
        template: "check-your-email/index.njk",
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
      })(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/password-reset-required");
    });

    it("if account has no AIS status, redirects to /get-security-codes", async () => {
      const accountInterventionService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        false,
        false
      );
      await verifyCodePost(verifyCodeService, accountInterventionService, {
        notificationType:
          NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
        template: "check-your-email/index.njk",
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
      })(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/get-security-codes");
    });
  });

  describe("When code is valid and NOTIFICATION_TYPE.MFA_SMS", () => {
    const verifyCodeService = fakeVerifyCodeServiceHelper(true);
    beforeEach(() => {
      req = mockRequest({
        path: PATH_NAMES.RESET_PASSWORD_2FA_SMS,
        session: { client: {}, user: { email: "test@test.com" } },
        log: { info: sinon.fake() },
      });
    })

    it("if account has no AIS status, redirects to reset password", async () => {
      const accountInterventionService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        false,
        false
      );
      await verifyCodePost(verifyCodeService, accountInterventionService, {
        notificationType: NOTIFICATION_TYPE.MFA_SMS,
        template: "check-your-email/index.njk",
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
        journeyType: JOURNEY_TYPE.PASSWORD_RESET_MFA,
      })(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("if account has only temporary suspension status, redirects to /unavailable-temporary", async () => {
      const accountInterventionService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        false,
        true
      );
      await verifyCodePost(verifyCodeService, accountInterventionService, {
        notificationType: NOTIFICATION_TYPE.MFA_SMS,
        template: "check-your-email/index.njk",
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
        journeyType: JOURNEY_TYPE.PASSWORD_RESET_MFA,
      })(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/unavailable-temporary");
    });

    it("if account has only permanent suspension status, redirects to /unavailable-permanent", async () => {
      const accountInterventionService = accountInterventionsFakeHelper(
        "test@test.com",
        false,
        true,
        false
      );
      await verifyCodePost(verifyCodeService, accountInterventionService, {
        notificationType: NOTIFICATION_TYPE.MFA_SMS,
        template: "check-your-email/index.njk",
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
        journeyType: JOURNEY_TYPE.PASSWORD_RESET_MFA,
      })(req as Request, res as Response);

      expect(accountInterventionService.accountInterventionStatus).to.have.been
        .called;
      expect(res.redirect).to.have.calledWith("/unavailable-permanent");
    });
  });
});
