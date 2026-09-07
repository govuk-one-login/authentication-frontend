import { afterEach, describe } from "mocha";
import { resetPasswordResendCode2faSmsGet } from "../reset-password-resend-code-2fa-sms-controller.js";
import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { expect } from "chai";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { sinon } from "../../../../test/utils/test-utils.js";

const TEST_REDACTED_PHONE_NUMBER = "1234";
const TEST_DEFAULT_MFA_ID = "test-mfa-id";

describe("reset password resend code 2fa sms controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    process.env.SUPPORT_REAUTHENTICATION = "1";

    req = createMockRequest(PATH_NAMES.RESET_PASSWORD_2FA_SMS);
    res = mockResponse();

    req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
    req.session.user.mfaMethods = buildMfaMethods({
      id: TEST_DEFAULT_MFA_ID,
      redactedPhoneNumber: TEST_REDACTED_PHONE_NUMBER,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPasswordResendCode2faSmsGet", () => {
    it("should render reset password resend code 2fa sms view", () => {
      resetPasswordResendCode2faSmsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWithMatch(
        "reset-password-resend-code-2fa-sms/index.njk",
        sinon.match({
          redactedPhoneNumber: TEST_REDACTED_PHONE_NUMBER,
          supportReauthentication: true,
          isReauthJourney: false,
        })
      );
    });

    it("should render security-code-error/index-wait.njk if user has been locked out in current session", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      req.session.user.codeRequestLock = tomorrow.toUTCString();
      resetPasswordResendCode2faSmsGet(req as Request, res as Response);
      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });

    [
      {
        isSignInJourney: true,
        isAccountRecoveryJourney: false,
        expectedShow2HrScreen: true,
      },
      {
        isSignInJourney: false,
        isAccountRecoveryJourney: true,
        expectedShow2HrScreen: false,
      },
      {
        isSignInJourney: true,
        isAccountRecoveryJourney: true,
        expectedShow2HrScreen: false,
      },
    ].forEach((i) => {
      it(`should render correct lockout when isSignInJourney is ${i.isSignInJourney} and isAccountRecoveryJourney is ${i.isAccountRecoveryJourney}`, () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        req.session.user.wrongCodeEnteredLock = tomorrow.toUTCString();
        req.session.user.isSignInJourney = i.isSignInJourney;
        req.session.user.isAccountRecoveryJourney = i.isAccountRecoveryJourney;

        resetPasswordResendCode2faSmsGet(req as Request, res as Response);

        expect(res.render).to.have.calledWithMatch(
          "security-code-error/index-security-code-entered-exceeded.njk",
          sinon.match({
            show2HrScreen: i.expectedShow2HrScreen,
          })
        );
      });
    });
  });
});
