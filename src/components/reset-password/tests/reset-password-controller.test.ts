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
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { EnterPasswordServiceInterface } from "../../enter-password/types";
import { MfaServiceInterface } from "../../common/mfa/types";

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
    req = mockRequest({
      path: PATH_NAMES.RESET_PASSWORD,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
    res.locals.sessionId = "s-123456-djjad";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPasswordRequestGet", () => {
    it("should redirect to /reset-password-check-mail when reset password requested", () => {
      req.path = PATH_NAMES.RESET_PASSWORD_REQUEST;

      resetPasswordRequestGet(req as Request, res as Response);

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
        it("should redirect to /enter-code when password updated and phone number verified", async () => {
          const fakeResetService: ResetPasswordServiceInterface = {
            updatePassword: sinon.fake.returns({ success: true }),
          } as unknown as ResetPasswordServiceInterface;
          const fakeLoginService: EnterPasswordServiceInterface = {
            loginUser: sinon.fake.returns({
              success: true,
              data: {
                redactedPhoneNumber: "1234",
                consentRequired: false,
                latestTermsAndConditionsAccepted: true,
                mfaMethodVerified: true,
                mfaMethodType: MFA_METHOD_TYPE.SMS,
                mfaRequired: true,
                passwordChangeRequired: params.passwordChangeRequired,
              },
            }),
          } as unknown as EnterPasswordServiceInterface;
          fakeLoginService.loginUser;
          const fakeMfAService: MfaServiceInterface = {
            sendMfaCode: sinon.fake.returns({ success: true }),
          } as unknown as MfaServiceInterface;

          req.session.user = {
            email: "joe.bloggs@test.com",
            isPasswordChangeRequired: params.passwordChangeRequired,
          };
          req.body.password = "Password1";

          await resetPasswordPost(
            fakeResetService,
            fakeLoginService,
            fakeMfAService
          )(req as Request, res as Response);

          expect(fakeResetService.updatePassword).to.have.been.calledOnce;
          expect(fakeLoginService.loginUser).to.have.been.calledOnce;
          expect(fakeMfAService.sendMfaCode).to.have.been.calledOnce;

          if (
            params.supportPasswordResetRequired === "1" &&
            params.passwordChangeRequired
          ) {
            expect(req.session.user.isPasswordChangeRequired).to.be.eq(false);
          }

          expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_MFA);
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
                consentRequired: false,
                latestTermsAndConditionsAccepted: true,
                mfaMethodVerified: false,
                mfaRequired: true,
                passwordChangeRequired: params.passwordChangeRequired,
              },
            }),
          } as unknown as EnterPasswordServiceInterface;
          fakeLoginService.loginUser;
          const fakeMfAService: MfaServiceInterface = {
            sendMfaCode: sinon.fake.returns({ success: true }),
          } as unknown as MfaServiceInterface;

          req.session.user = {
            email: "joe.bloggs@test.com",
          };
          req.body.password = "Password1";

          await resetPasswordPost(
            fakeResetService,
            fakeLoginService,
            fakeMfAService
          )(req as Request, res as Response);

          expect(fakeResetService.updatePassword).to.have.been.calledOnce;
          expect(fakeLoginService.loginUser).to.have.been.calledOnce;
          expect(fakeMfAService.sendMfaCode).to.not.have.been.called;

          expect(res.redirect).to.have.calledWith(
            PATH_NAMES.GET_SECURITY_CODES
          );
        });
      }
    );

    it("should request 2fa when password updated even for non 2fa service", async () => {
      const fakeResetService: ResetPasswordServiceInterface = {
        updatePassword: sinon.fake.returns({ success: true }),
      } as unknown as ResetPasswordServiceInterface;
      const fakeLoginService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          success: true,
          data: {
            redactedPhoneNumber: "1234",
            consentRequired: false,
            latestTermsAndConditionsAccepted: true,
            mfaMethodVerified: true,
            mfaRequired: false,
            mfaMethodType: MFA_METHOD_TYPE.SMS,
            passwordChangeRequired: params.passwordChangeRequired,
          },
        }),
      } as unknown as EnterPasswordServiceInterface;
      fakeLoginService.loginUser;
      const fakeMfAService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({ success: true }),
      } as unknown as MfaServiceInterface;

      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body.password = "Password1";

      await resetPasswordPost(
        fakeResetService,
        fakeLoginService,
        fakeMfAService
      )(req as Request, res as Response);

      expect(fakeResetService.updatePassword).to.have.been.calledOnce;
      expect(fakeLoginService.loginUser).to.have.been.calledOnce;
      expect(fakeMfAService.sendMfaCode).to.have.been.calledOnce;

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_MFA);
    });
  });
});
