import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { VerifyCodeInterface } from "../../../common/verify-code/types";
import {
  checkYourEmailSecurityCodesGet,
  checkYourEmailSecurityCodesPost,
} from "../check-your-email-security-codes-controller";
import { PATH_NAMES } from "../../../../app.constants";
import { ERROR_CODES } from "../../../common/constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { accountInterventionsFakeHelper } from "../../../../../test/helpers/account-interventions-helpers";

function fakeVerifyCodeServiceHelper(success: boolean) {
  const fakeService: VerifyCodeInterface = {
    verifyCode: sinon.fake.returns({
      success: success,
      data: { code: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE },
    }),
  } as unknown as VerifyCodeInterface;
  return fakeService;
}

describe("check your email change security codes controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
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
      const fakeAccountInterventionsService = accountInterventionsFakeHelper(
        "test@test.co.uk",
        false,
        false,
        false
      );

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
      const fakeAccountInterventionsService = accountInterventionsFakeHelper(
        "test@test.co.uk",
        false,
        false,
        false
      );

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
      const fakeAccountInterventionsService = accountInterventionsFakeHelper(
        "test@test.co.uk",
        true,
        false,
        true
      );

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

    it("should return error when invalid code", async () => {
      const fakeService = fakeVerifyCodeServiceHelper(false);

      const fakeAccountInterventionsService = accountInterventionsFakeHelper(
        "test@test.co.uk",
        false,
        false,
        false
      );

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
