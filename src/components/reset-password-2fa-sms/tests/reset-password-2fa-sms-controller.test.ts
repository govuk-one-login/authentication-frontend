import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import { Request, Response } from "express";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES } from "../../common/constants.js";
import {
  resetPassword2FASmsGet,
  resetPassword2FASmsPost,
} from "../reset-password-2fa-sms-controller.js";
import { VerifyCodeInterface } from "../../common/verify-code/types.js";
import { MfaServiceInterface } from "../../common/mfa/types.js";
import { fakeVerifyCodeServiceHelper } from "../../../../test/helpers/verify-code-helpers.js";
import { accountInterventionsFakeHelper } from "../../../../test/helpers/account-interventions-helpers.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("reset password 2fa auth app controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.RESET_PASSWORD_2FA_SMS);
    res = mockResponse();
  });

  afterEach(() => {
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
    sinon.restore();
  });

  describe("resetPassword2FASmsGet", () => {
    it("should render reset password auth app view", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };

      await resetPassword2FASmsGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("reset-password-2fa-sms/index.njk");
    });

    it("should render index-security-code-entered-exceeded.njk view when user is account is locked from entering security codes", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: false,
        }),
      } as unknown as MfaServiceInterface;

      const date = new Date();
      const futureDate = new Date(
        date.setDate(date.getDate() + 6)
      ).toUTCString();

      req.session.user = {
        email: "joe.bloggs@test.com",
        reauthenticate: "1234",
        wrongCodeEnteredLock: futureDate,
      };

      await resetPassword2FASmsGet(fakeService)(
        req as Request,
        res as Response
      );
      expect(res.render).to.have.calledWith(
        "security-code-error/index-security-code-entered-exceeded.njk"
      );
    });

    it("should render security-code-error/index-wait.njk when user was locked out in the current session for requesting too many security codes", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      req.session.user.codeRequestLock = tomorrow.toUTCString();

      await resetPassword2FASmsGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });
  });

  describe("resetPassword2FASmsPost", () => {
    it("should redirect to reset-password if code entered is correct and feature flag is turned on", async () => {
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

      await resetPassword2FASmsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("should render check email page with errors if incorrect code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.INVALID_MFA_CODE,
          },
        }),
      } as unknown as VerifyCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.session.user.enterEmailMfaType = "SMS";
      req.body.code = "123456";

      await resetPassword2FASmsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("reset-password-2fa-sms/index.njk");
    });

    it("should redirect to /unavailable-temporary when temporarilySuspended status applied to account and they try to reset their password", async () => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
      const fakeService = fakeVerifyCodeServiceHelper(true);
      const fakeInterventionsService = accountInterventionsFakeHelper({
        temporarilySuspended: true,
        blocked: false,
        passwordResetRequired: false,
        reproveIdentity: false,
      });
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      await resetPassword2FASmsPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.UNAVAILABLE_TEMPORARY);
    });

    it("should redirect to /unavailable-permanent when bloced status applied to account and they try to reset their password", async () => {
      process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
      const fakeService = fakeVerifyCodeServiceHelper(true);
      const fakeInterventionsService = accountInterventionsFakeHelper({
        blocked: true,
        temporarilySuspended: false,
        passwordResetRequired: false,
        reproveIdentity: false,
      });
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      await resetPassword2FASmsPost(fakeService, fakeInterventionsService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.UNAVAILABLE_PERMANENT);
    });
  });
});
