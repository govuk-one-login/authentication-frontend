import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils.js";
import { Request, Response } from "express";
import {
  checkYourEmailSecurityCodesGet,
  checkYourEmailSecurityCodesPost,
} from "../check-your-email-security-codes-controller.js";
import { PATH_NAMES } from "../../../../app.constants.js";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import {
  accountInterventionsFakeHelper,
  noInterventions,
} from "../../../../../test/helpers/account-interventions-helpers.js";
import { fakeVerifyCodeServiceHelper } from "../../../../../test/helpers/verify-code-helpers.js";
import { ERROR_CODES } from "../../../common/constants.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
describe("check your email change security codes controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("checkYourEmailChangeSecurityCodesGet", () => {
    it("should render the check your email view", () => {
      checkYourEmailSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith(
        "account-recovery/check-your-email-security-codes/index.njk"
      );
    });
  });

  describe("checkYourEmailChangeSecurityCodesPost", () => {
    beforeEach(() => {
      req.body.code = "123456";
      req.session.id = "123456-djjad";
      req.session.user.email = "test@test.com";
    });

    it("should redirect to /get-security-codes and not call AIS when valid code entered and account interventions is turned on", async () => {
      const fakeVerifyCodeService = fakeVerifyCodeServiceHelper(true);
      const fakeAccountInterventionsService =
        accountInterventionsFakeHelper(noInterventions);

      await checkYourEmailSecurityCodesPost(
        fakeVerifyCodeService,
        fakeAccountInterventionsService
      )(req as Request, res as Response);

      expect(fakeAccountInterventionsService.accountInterventionStatus).to.not
        .have.been.calledOnce;
      expect(fakeVerifyCodeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.GET_SECURITY_CODES);
    });

    it("should redirect to /get-security-codes when valid code entered and there are no interventions in place and account interventions is turned on", async () => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
      const fakeVerifyCodeService = fakeVerifyCodeServiceHelper(true);
      const fakeAccountInterventionsService =
        accountInterventionsFakeHelper(noInterventions);

      await checkYourEmailSecurityCodesPost(
        fakeVerifyCodeService,
        fakeAccountInterventionsService
      )(req as Request, res as Response);

      expect(fakeAccountInterventionsService.accountInterventionStatus).to.have
        .been.calledOnce;
      expect(fakeVerifyCodeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.GET_SECURITY_CODES);
    });

    it("should redirect to /password-reset-required when temporarilySuspended and resetPasswordRequired statuses applied to account.", async () => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
      const fakeVerifyCodeService = fakeVerifyCodeServiceHelper(true);
      const fakeAccountInterventionsService = accountInterventionsFakeHelper({
        passwordResetRequired: true,
        blocked: false,
        temporarilySuspended: true,
        reproveIdentity: false,
      });

      await checkYourEmailSecurityCodesPost(
        fakeVerifyCodeService,
        fakeAccountInterventionsService
      )(req as Request, res as Response);

      expect(fakeAccountInterventionsService.accountInterventionStatus).to.have
        .been.calledOnce;
      expect(fakeVerifyCodeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.PASSWORD_RESET_REQUIRED
      );
    });

    it("should redirect to /unavailable-temporary when only temporarilySuspended AIS status applied to account", async () => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
      const fakeVerifyCodeService = fakeVerifyCodeServiceHelper(true);
      const fakeAccountInterventionsService = accountInterventionsFakeHelper({
        temporarilySuspended: true,
        blocked: false,
        passwordResetRequired: false,
        reproveIdentity: false,
      });

      await checkYourEmailSecurityCodesPost(
        fakeVerifyCodeService,
        fakeAccountInterventionsService
      )(req as Request, res as Response);

      expect(fakeAccountInterventionsService.accountInterventionStatus).to.have
        .been.calledOnce;
      expect(fakeVerifyCodeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.UNAVAILABLE_TEMPORARY);
    });

    it("should redirect to /unavailable-permanent when only blocked AIS status applied to account", async () => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
      const fakeVerifyCodeService = fakeVerifyCodeServiceHelper(true);
      const fakeAccountInterventionsService = accountInterventionsFakeHelper({
        blocked: true,
        passwordResetRequired: false,
        temporarilySuspended: false,
        reproveIdentity: false,
      });

      await checkYourEmailSecurityCodesPost(
        fakeVerifyCodeService,
        fakeAccountInterventionsService
      )(req as Request, res as Response);

      expect(fakeAccountInterventionsService.accountInterventionStatus).to.have
        .been.calledOnce;
      expect(fakeVerifyCodeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.UNAVAILABLE_PERMANENT);
    });

    it("should return error when invalid code", async () => {
      const fakeService = fakeVerifyCodeServiceHelper(
        false,
        ERROR_CODES.INVALID_VERIFY_EMAIL_CODE
      );

      const fakeAccountInterventionsService =
        accountInterventionsFakeHelper(noInterventions);

      await checkYourEmailSecurityCodesPost(
        fakeService,
        fakeAccountInterventionsService
      )(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith(
        "account-recovery/check-your-email-security-codes/index.njk"
      );
    });
  });
});
