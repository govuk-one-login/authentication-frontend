import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  securityCodeCannotRequestCodeGet,
  securityCodeInvalidGet,
  securityCodeTriesExceededGet,
  securityCodeEnteredExceededGet,
  getNewCodePath,
} from "../security-code-error-controller";
import {
  pathWithQueryParam,
  SECURITY_CODE_ERROR,
  SecurityCodeErrorType,
} from "../../common/constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants";

describe("security code controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
      session: { client: {}, user: { featureFlags: {} } },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("securityCodeExpiredGet", () => {
    [
      {
        actionType: SecurityCodeErrorType.EmailMaxRetries,
        expectedRenderOptions: {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.RESEND_EMAIL_CODE,
            "requestNewCode",
            "true"
          ),
          isAuthApp: false,
          isBlocked: false,
          show2HrScreen: false,
        },
      },
      {
        actionType: SecurityCodeErrorType.MfaMaxRetries,
        expectedRenderOptions: {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
            SECURITY_CODE_ERROR,
            SecurityCodeErrorType.MfaMaxRetries
          ),
          isAuthApp: false,
          isBlocked: true,
          show2HrScreen: false,
        },
      },
      {
        actionType: SecurityCodeErrorType.AuthAppMfaMaxRetries,
        expectedRenderOptions: {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
            SECURITY_CODE_ERROR,
            SecurityCodeErrorType.AuthAppMfaMaxRetries
          ),
          isAuthApp: true,
          isBlocked: true,
          show2HrScreen: false,
        },
      },
      {
        actionType: SecurityCodeErrorType.OtpMaxRetries,
        expectedRenderOptions: {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.RESEND_MFA_CODE,
            "isResendCodeRequest",
            "true"
          ),
          isAuthApp: false,
          isBlocked: true,
          show2HrScreen: false,
        },
      },
    ].forEach(({ actionType, expectedRenderOptions }) => {
      it(`should render invalid OTP code for ${actionType} error when email OTP code has been invalid max number of times`, () => {
        req.session.user = {
          email: "joe.bloggs@test.com",
        };
        req.query.actionType = actionType;

        securityCodeInvalidGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith(
          "security-code-error/index.njk",
          expectedRenderOptions
        );
      });
    });
  });

  describe("securityCodeTriesExceededGet", () => {
    const TEST_SCENARIO_PARAMETERS = [
      {
        actionType: SecurityCodeErrorType.EmailMaxCodesSent,
        newCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
        isAccountCreationJourney: undefined,
      },
      {
        actionType: SecurityCodeErrorType.MfaMaxRetries,
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
          SECURITY_CODE_ERROR,
          SecurityCodeErrorType.MfaMaxRetries
        ),
        isAccountCreationJourney: undefined,
      },
      {
        actionType: SecurityCodeErrorType.OtpMaxCodesSent,
        newCodeLink: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
        isAccountCreationJourney: undefined,
      },
      {
        actionType: SecurityCodeErrorType.OtpMaxRetries,
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
          "isResendCodeRequest",
          "true"
        ),
        isAccountCreationJourney: true,
      },
    ];

    TEST_SCENARIO_PARAMETERS.forEach(function (params) {
      it(`should render index-too-many-requests.njk for ${params.actionType} when max number of codes have been sent`, () => {
        req.query.actionType = params.actionType;
        req.session.user.isAccountCreationJourney =
          params.isAccountCreationJourney;

        securityCodeTriesExceededGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith(
          "security-code-error/index-too-many-requests.njk",
          {
            newCodeLink: params.newCodeLink,
            isResendCodeRequest: undefined,
            isAccountCreationJourney: params.isAccountCreationJourney,
            support2hrLockout: false,
          }
        );
      });
    });
  });

  describe("securityCodeCannotRequestGet", () => {
    const TEST_SCENARIO_PARAMETERS = [
      {
        actionType: SecurityCodeErrorType.OtpBlocked,
        expectedCodeLink: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
      },
      {
        actionType: SecurityCodeErrorType.MfaBlocked,
        expectedCodeLink: PATH_NAMES.RESEND_MFA_CODE,
      },
      {
        actionType: SecurityCodeErrorType.EmailBlocked,
        expectedCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
      },
    ];

    TEST_SCENARIO_PARAMETERS.forEach(function (params) {
      it(`should render the too many requests page for ${params.actionType} when user is blocked from requesting more OTPs`, () => {
        req.query.actionType = params.actionType;

        securityCodeCannotRequestCodeGet(req, res);

        expect(res.render).to.have.calledWith(
          "security-code-error/index-too-many-requests.njk",
          {
            newCodeLink: params.expectedCodeLink,
            support2hrLockout: false,
          }
        );
      });
    });
  });

  describe("securityCodeEnteredExceededGet", () => {
    it("should render index-security-code-entered-exceeded.njk when SMS code has been used max number of times", () => {
      req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;

      securityCodeEnteredExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-security-code-entered-exceeded.njk",
        { newCodeLink: PATH_NAMES.RESEND_MFA_CODE, isAuthApp: false }
      );
    });

    it("should render index-security-code-entered-exceeded.njk when Auth App code has been used max number of times", () => {
      req.query.actionType = SecurityCodeErrorType.AuthAppMfaMaxRetries;

      securityCodeEnteredExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          isAuthApp: true,
        }
      );
    });
  });

  describe("support2Hr Lockout", () => {
    let clock: sinon.SinonFakeTimers;
    const date = new Date(Date.UTC(2024, 0, 1, 0));
    before(() => {
      process.env.SUPPORT_2HR_LOCKOUT = "1";
      clock = sinon.useFakeTimers({
        now: date.valueOf(),
      });
    });

    after(() => {
      delete process.env.SUPPORT_2HR_LOCKOUT;
      delete process.env.CODE_ENTERED_WRONG_BLOCKED_MINUTES;
      delete process.env.ACCOUNT_RECOVERY_CODE_ENTERED_WRONG_BLOCKED_MINUTES;

      clock.restore();
    });

    describe("securityCodeInvalidGet", () => {
      it(
        "should render 2hr lockout page when email OTP code has been invalid max number of times" +
          "in the reset password journey",
        () => {
          req.session.user.isPasswordResetJourney = true;
          req.query.actionType = SecurityCodeErrorType.EmailMaxRetries;

          securityCodeInvalidGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "security-code-error/index.njk",
            {
              newCodeLink: pathWithQueryParam(
                PATH_NAMES.RESEND_EMAIL_CODE,
                "requestNewCode",
                "true"
              ),
              isAuthApp: false,
              isBlocked: false,
              show2HrScreen: true,
            }
          );
        }
      );

      it(
        "should render 2hr lockout page when email OTP code has been invalid max number of times" +
          "in 2FA account recovery journey",
        () => {
          req.session.user.isAccountRecoveryJourney = true;
          req.query.actionType = SecurityCodeErrorType.EmailMaxRetries;

          securityCodeInvalidGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "security-code-error/index.njk",
            {
              newCodeLink: pathWithQueryParam(
                PATH_NAMES.RESEND_EMAIL_CODE,
                "requestNewCode",
                "true"
              ),
              isAuthApp: false,
              isBlocked: false,
              show2HrScreen: true,
            }
          );
        }
      );

      it("should not render the 2 hour lockout page if the user is in the account creation journey", () => {
        const TEST_SCENARIO_PARAMETERS = [
          {
            action: SecurityCodeErrorType.EmailMaxRetries,
            isBlocked: false,
            nextPath: PATH_NAMES.RESEND_EMAIL_CODE,
            queryParam: "requestNewCode",
          },
          {
            action: SecurityCodeErrorType.OtpMaxRetries,
            isBlocked: true,
            nextPath: PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
            queryParam: "isResendCodeRequest",
          },
        ];

        TEST_SCENARIO_PARAMETERS.forEach((params) => {
          req.session.user.isAccountCreationJourney = true;
          req.query.actionType = params.action;

          securityCodeInvalidGet(req, res);

          expect(res.render).to.have.calledWith(
            "security-code-error/index.njk",
            {
              newCodeLink: pathWithQueryParam(
                params.nextPath,
                params.queryParam,
                "true"
              ),
              isAuthApp: false,
              isBlocked: params.isBlocked,
              show2HrScreen: false,
            }
          );
        });
      });

      it(
        "should render security-code-error/index.njk and set lock when user entered too many SMS OTPs " +
          "in the sign-in journey",
        () => {
          process.env.CODE_ENTERED_WRONG_BLOCKED_MINUTES = "120";
          req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;
          req.session.user.isSignInJourney = true;
          securityCodeInvalidGet(req as Request, res as Response);
          expect(res.render).to.have.calledWith(
            "security-code-error/index.njk",
            {
              newCodeLink: pathWithQueryParam(
                PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
                "actionType",
                "mfaMaxRetries"
              ),
              isAuthApp: false,
              isBlocked: true,
              show2HrScreen: true,
            }
          );
          expect(req.session.user.wrongCodeEnteredLock).to.eq(
            "Mon, 01 Jan 2024 02:00:00 GMT"
          );
        }
      );

      it(
        "should render security-code-error/index.njk and set lock when user entered too many EMAIL OTPs " +
          "in the account recovery journey",
        () => {
          process.env.ACCOUNT_RECOVERY_CODE_ENTERED_WRONG_BLOCKED_MINUTES =
            "15";
          req.query.actionType =
            SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries;
          req.session.user.isAccountRecoveryJourney = true;
          securityCodeInvalidGet(req as Request, res as Response);
          expect(res.render).to.have.calledWith(
            "security-code-error/index.njk",
            {
              newCodeLink: pathWithQueryParam(
                PATH_NAMES.RESEND_EMAIL_CODE,
                "requestNewCode",
                "true"
              ),
              isAuthApp: false,
              isBlocked: true,
              show2HrScreen: true,
            }
          );
          expect(req.session.user.wrongCodeEnteredAccountRecoveryLock).to.eq(
            "Mon, 01 Jan 2024 00:15:00 GMT"
          );
        }
      );

      it(
        "should render security-code-error/index.njk and set lock when user entered too many EMAIL OTPs " +
          "in the reset password journey",
        () => {
          process.env.PASSWORD_RESET_CODE_ENTERED_WRONG_BLOCKED_MINUTES = "120";
          req.query.actionType =
            SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries;
          req.session.user.isPasswordResetJourney = true;
          securityCodeInvalidGet(req as Request, res as Response);
          expect(res.render).to.have.calledWith(
            "security-code-error/index.njk",
            {
              newCodeLink: pathWithQueryParam(
                PATH_NAMES.RESEND_EMAIL_CODE,
                "requestNewCode",
                "true"
              ),
              isAuthApp: false,
              isBlocked: true,
              show2HrScreen: true,
            }
          );
          expect(req.session.user.wrongCodeEnteredPasswordResetLock).to.eq(
            "Mon, 01 Jan 2024 02:00:00 GMT"
          );
        }
      );
    });

    describe("securityCodeTriesExceededGet", () => {
      let clock: sinon.SinonFakeTimers;
      const date = new Date(Date.UTC(2024, 0, 1, 0));
      before(() => {
        clock = sinon.useFakeTimers({
          now: date.valueOf(),
        });
      });

      after(() => {
        delete process.env.CODE_REQUEST_BLOCKED_MINUTES;
        clock.restore();
      });

      it(
        "should render index-too-many-requests.njk and set block on session for MfaMaxRetries when max number of " +
          "codes have been sent and user is in the sign-in journey",
        () => {
          process.env.CODE_REQUEST_BLOCKED_MINUTES = "15";
          req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;
          req.session.user.isSignInJourney = true;
          securityCodeTriesExceededGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "security-code-error/index-too-many-requests.njk",
            {
              newCodeLink: pathWithQueryParam(
                PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
                SECURITY_CODE_ERROR,
                SecurityCodeErrorType.MfaMaxRetries
              ),
              isResendCodeRequest: undefined,
              isAccountCreationJourney: undefined,
              support2hrLockout: true,
            }
          );
          expect(req.session.user.codeRequestLock).to.eq(
            "Mon, 01 Jan 2024 00:15:00 GMT"
          );
        }
      );

      it(
        "should render index-too-many-requests.njk for MfaMaxRetries when max number of codes have been sent" +
          "and user is in the sign-in journey",
        () => {
          req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;
          req.session.user.isPasswordResetJourney = true;
          securityCodeTriesExceededGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "security-code-error/index-too-many-requests.njk",
            {
              newCodeLink: pathWithQueryParam(
                PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
                SECURITY_CODE_ERROR,
                SecurityCodeErrorType.MfaMaxRetries
              ),
              isResendCodeRequest: undefined,
              isAccountCreationJourney: undefined,
              support2hrLockout: true,
            }
          );
        }
      );

      it(
        "should render index-too-many-requests.njk for OtpBlocked when max number of codes have been requested " +
          "and user is in the 2FA SMS account recovery journey",
        () => {
          req.query.actionType = SecurityCodeErrorType.OtpBlocked;
          req.session.user.isAccountRecoveryJourney = true;
          securityCodeTriesExceededGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "security-code-error/index-too-many-requests.njk",
            {
              newCodeLink: getNewCodePath(SecurityCodeErrorType.OtpBlocked),
              isResendCodeRequest: undefined,
              isAccountCreationJourney: undefined,
              support2hrLockout: true,
            }
          );
        }
      );

      it(
        "should render index-too-many-requests.njk for MfaMaxRetries when max number of codes have been sent" +
          "and user is in the account creation journey",
        () => {
          req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;
          req.session.user.isAccountCreationJourney = true;
          securityCodeTriesExceededGet(req as Request, res as Response);

          expect(res.render).to.have.calledWith(
            "security-code-error/index-too-many-requests.njk",
            {
              newCodeLink: pathWithQueryParam(
                PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
                SECURITY_CODE_ERROR,
                SecurityCodeErrorType.MfaMaxRetries
              ),
              isResendCodeRequest: undefined,
              isAccountCreationJourney: true,
              support2hrLockout: true,
            }
          );
        }
      );
    });
  });
});
