import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  resetPasswordGet,
  resetPasswordPost,
  resetPasswordRequestGet,
  resetPasswordRequiredGet,
} from "../reset-password-controller";
import { ResetPasswordServiceInterface } from "../types";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { EnterPasswordServiceInterface } from "../../enter-password/types";
import { ERROR_CODES } from "../../common/constants";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

const TEST_SCENARIO_PARAMETERS = [
  {
    supportPasswordResetRequired: "0",
    passwordChangeRequired: false,
  },
  {
    supportPasswordResetRequired: "0",
    passwordChangeRequired: true,
  },
  {
    supportPasswordResetRequired: "1",
    passwordChangeRequired: false,
  },
  {
    supportPasswordResetRequired: "1",
    passwordChangeRequired: true,
  },
];

describe("reset password controller (in 6 digit code flow)", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.RESET_PASSWORD);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPasswordRequestGet", async () => {
    it("should redirect to /reset-password-check-mail when reset password requested", async () => {
      req.path = PATH_NAMES.RESET_PASSWORD_REQUEST;

      await resetPasswordRequestGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL
      );
    });
  });

  describe("resetPasswordRequiredGet", () => {
    it("should render the reset password required page", () => {
      req.session.user.isPasswordChangeRequired = true;
      resetPasswordRequiredGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("reset-password/index.njk", {
        isPasswordChangeRequired: true,
        contentId: "a95d02f6-6445-4112-b0c2-7a6d4f804b99",
      });
    });
  });

  describe("resetPasswordGet", () => {
    it("should render change password page", () => {
      resetPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("reset-password/index.njk");
    });
  });

  TEST_SCENARIO_PARAMETERS.forEach(function (params) {
    describe(
      "resetPasswordPost supportPasswordResetRequired: " +
        params.supportPasswordResetRequired +
        " passwordChangeRequired: " +
        params.passwordChangeRequired,
      () => {
        it("should redirect to /auth-code if request is success", async () => {
          const fakeResetService: ResetPasswordServiceInterface = {
            updatePassword: sinon.fake.returns({ success: true }),
          } as unknown as ResetPasswordServiceInterface;
          const fakeLoginService: EnterPasswordServiceInterface = {
            loginUser: sinon.fake.returns({
              success: true,
              data: {
                redactedPhoneNumber: "1234",
                latestTermsAndConditionsAccepted: true,
                mfaMethodVerified: true,
                mfaMethodType: MFA_METHOD_TYPE.SMS,
                mfaRequired: true,
                passwordChangeRequired: params.passwordChangeRequired,
              },
            }),
          } as unknown as EnterPasswordServiceInterface;
          fakeLoginService.loginUser;

          await resetPasswordPost(fakeResetService, fakeLoginService)(
            req as Request,
            res as Response
          );

          expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
        });

        it("should redirect to /get-security-codes when password updated and mfa method not verified", async () => {
          const fakeResetService: ResetPasswordServiceInterface = {
            updatePassword: sinon.fake.returns({ success: true }),
          } as unknown as ResetPasswordServiceInterface;
          const fakeLoginService: EnterPasswordServiceInterface = {
            loginUser: sinon.fake.returns({
              success: true,
              data: {
                redactedPhoneNumber: "1234",
                latestTermsAndConditionsAccepted: true,
                mfaMethodVerified: false,
                mfaRequired: true,
                passwordChangeRequired: params.passwordChangeRequired,
              },
            }),
          } as unknown as EnterPasswordServiceInterface;
          fakeLoginService.loginUser;

          req.session.user = {
            email: "joe.bloggs@test.com",
          };
          req.body.password = "Password1";

          await resetPasswordPost(fakeResetService, fakeLoginService)(
            req as Request,
            res as Response
          );

          expect(fakeResetService.updatePassword).to.have.been.calledOnce;
          expect(fakeLoginService.loginUser).to.have.been.calledOnce;

          expect(res.redirect).to.have.calledWith(
            PATH_NAMES.GET_SECURITY_CODES
          );
        });
      }
    );

    it("should not set the passwordResetTime flag on the session if update password is not a success", async () => {
      const fakeResetService: ResetPasswordServiceInterface = {
        updatePassword: sinon.fake.returns({
          success: false,
          data: { code: ERROR_CODES.NEW_PASSWORD_SAME_AS_EXISTING },
        }),
      } as unknown as ResetPasswordServiceInterface;
      const fakeLoginService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          success: true,
          data: {
            redactedPhoneNumber: "1234",
            latestTermsAndConditionsAccepted: true,
            mfaMethodVerified: true,
            mfaRequired: false,
            mfaMethodType: MFA_METHOD_TYPE.SMS,
            passwordChangeRequired: params.passwordChangeRequired,
          },
        }),
      } as unknown as EnterPasswordServiceInterface;
      fakeLoginService.loginUser;

      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body.password = "Password1";

      await resetPasswordPost(fakeResetService, fakeLoginService)(
        req as Request,
        res as Response
      );

      expect(fakeResetService.updatePassword).to.have.been.calledOnce;
      expect(fakeLoginService.loginUser).not.to.have.been.called;

      expect(req.session.user.passwordResetTime).to.be.undefined;
    });
  });
});
