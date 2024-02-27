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
import { AccountInterventionsInterface } from "../../../account-intervention/types";

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
    it("should redirect to /get-security-codes and not call AIS when valid code entered and account interventions is turned on", async () => {
      const fakeVerifyCodeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      const fakeAccountInterventionsService: AccountInterventionsInterface = {
        accountInterventionStatus: sinon.fake.returns({
          data: {
            email: "test@test.com",
            passwordResetRequired: false,
            blocked: false,
            temporarilySuspended: false,
          },
        }),
      } as unknown as AccountInterventionsInterface;

      req.body.code = "123456";
      req.session.id = "123456-djjad";
      req.session.user.email = "test@test.com";

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
      const fakeVerifyCodeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      const fakeAccountInterventionsService: AccountInterventionsInterface = {
        accountInterventionStatus: sinon.fake.returns({
          data: {
            email: "test@test.com",
            passwordResetRequired: false,
            blocked: false,
            temporarilySuspended: false,
          },
        }),
      } as unknown as AccountInterventionsInterface;

      req.body.code = "123456";
      req.session.id = "123456-djjad";
      req.session.user.email = "test@test.com";

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
      const fakeVerifyCodeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      const fakeAccountInterventionsService: AccountInterventionsInterface = {
        accountInterventionStatus: sinon.fake.returns({
          data: {
            email: "test@test.com",
            passwordResetRequired: true,
            blocked: false,
            temporarilySuspended: true,
          },
        }),
      } as unknown as AccountInterventionsInterface;

      req.body.code = "123456";
      req.session.id = "123456-djjad";
      req.session.user.email = "test@test.com";

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
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: false,
          data: { code: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE },
        }),
      } as unknown as VerifyCodeInterface;

      req.body.code = "678988";
      req.session.id = "123456-djjad";
      req.session.user.email = "test@test.com";

      const fakeAccountInterventionsService: AccountInterventionsInterface = {
        accountInterventionStatus: sinon.fake.returns({
          email: "test@test.com",
          passwordResetRequired: false,
          blocked: false,
          temporarilySuspended: false,
        }),
      } as unknown as AccountInterventionsInterface;

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
