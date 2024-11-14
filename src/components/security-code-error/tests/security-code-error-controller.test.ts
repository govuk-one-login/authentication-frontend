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
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { SCENARIOS } from "./test-scenario-data";

describe("security code controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  const date = new Date(Date.UTC(2024, 0, 1, 0));

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
    res = mockResponse();
    sinon.useFakeTimers({
      now: new Date(Date.UTC(2024, 0, 1, 0)),
    });
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.CODE_ENTERED_WRONG_BLOCKED_MINUTES;
    delete process.env.ACCOUNT_RECOVERY_CODE_ENTERED_WRONG_BLOCKED_MINUTES;
    delete process.env.REDUCED_CODE_BLOCK_DURATION_MINUTES;
  });

  describe("securityCodeExpiredGet", () => {
    SCENARIOS.SECURITY_CODE_EXPIRED_GET.forEach(
      ({ actionType, expectedRenderOptions }) => {
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
      }
    );
  });

  describe("securityCodeTriesExceededGet", () => {
    SCENARIOS.SECURITY_CODE_TRIES_EXCEEDED_GET.forEach(function (params) {
      it(`should render index-too-many-requests.njk for ${params.actionType} when max number of codes have been sent`, () => {
        req.query.actionType = params.actionType;
        req.session.user.isAccountCreationJourney =
          params.isAccountCreationJourney;
        res.locals.strategicAppChannel = true;

        securityCodeTriesExceededGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith(
          "security-code-error/index-too-many-requests.njk",
          {
            newCodeLink: params.newCodeLink,
            isResendCodeRequest: undefined,
            isAccountCreationJourney: params.isAccountCreationJourney,
            contentId: params.contentId,
            strategicAppChannel: res.locals.strategicAppChannel,
          }
        );
      });
    });
  });

  describe("securityCodeCannotRequestGet", () => {
    SCENARIOS.SECURITY_CODE_CANNOT_REQUEST_GET.forEach(function (params) {
      it(`should render the too many requests page for ${params.actionType} when user is blocked from requesting more OTPs`, () => {
        req.query.actionType = params.actionType;

        securityCodeCannotRequestCodeGet(req, res);

        expect(res.render).to.have.calledWith(
          "security-code-error/index-too-many-requests.njk",
          {
            newCodeLink: params.expectedCodeLink,
            contentId: params.contentId,
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
        {
          newCodeLink: PATH_NAMES.RESEND_MFA_CODE,
          isAuthApp: false,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        }
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
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        }
      );
    });
  });

  describe("securityCodeInvalidGet", () => {
    it(
      "should render 2hr lockout page when email OTP code has been invalid max number of times" +
        "in the reset password journey",
      () => {
        req.session.user.isPasswordResetJourney = true;
        req.query.actionType = SecurityCodeErrorType.EmailMaxRetries;

        securityCodeInvalidGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith("security-code-error/index.njk", {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.RESEND_EMAIL_CODE,
            "requestNewCode",
            "true"
          ),
          isAuthApp: false,
          isBlocked: false,
          show2HrScreen: true,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        });
      }
    );

    it(
      "should render 2hr lockout page when email OTP code has been invalid max number of times" +
        "in 2FA account recovery journey",
      () => {
        req.session.user.isAccountRecoveryJourney = true;
        req.query.actionType = SecurityCodeErrorType.EmailMaxRetries;

        securityCodeInvalidGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith("security-code-error/index.njk", {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.RESEND_EMAIL_CODE,
            "requestNewCode",
            "true"
          ),
          isAuthApp: false,
          isBlocked: false,
          show2HrScreen: true,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        });
      }
    );

    it("should not render the 2 hour lockout page if the user is in the account creation journey", () => {
      SCENARIOS.ACCOUNT_CREATION_JOURNEY.forEach((params) => {
        req.session.user.isAccountCreationJourney = true;
        req.query.actionType = params.action;

        securityCodeInvalidGet(req, res);

        expect(res.render).to.have.calledWith("security-code-error/index.njk", {
          newCodeLink: pathWithQueryParam(
            params.nextPath,
            params.queryParam,
            "true"
          ),
          isAuthApp: false,
          isBlocked: params.isBlocked,
          show2HrScreen: false,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        });
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
        expect(res.render).to.have.calledWith("security-code-error/index.njk", {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
            "actionType",
            "mfaMaxRetries"
          ),
          isAuthApp: false,
          isBlocked: true,
          show2HrScreen: true,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        });
        expect(req.session.user.wrongCodeEnteredLock).to.eq(
          "Mon, 01 Jan 2024 02:00:00 GMT"
        );
      }
    );

    it(
      "should render security-code-error/index.njk and set lock when user entered too many SMS OTPs " +
        "in the account creation journey",
      () => {
        process.env.CODE_ENTERED_WRONG_BLOCKED_MINUTES = "30";
        process.env.REDUCED_CODE_BLOCK_DURATION_MINUTES = "15";
        req.query.actionType = SecurityCodeErrorType.OtpMaxRetries;
        req.session.user.isAccountCreationJourney = true;
        securityCodeInvalidGet(req as Request, res as Response);
        expect(res.render).to.have.calledWith("security-code-error/index.njk", {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
            "isResendCodeRequest",
            "true"
          ),
          isAuthApp: false,
          isBlocked: true,
          show2HrScreen: false,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        });
        expect(req.session.user.wrongCodeEnteredLock).to.eq(
          "Mon, 01 Jan 2024 00:15:00 GMT"
        );
      }
    );

    it(
      "should render security-code-error/index.njk and set lock when user entered too many SMS OTPs " +
        "in the account recovery journey",
      () => {
        process.env.CODE_ENTERED_WRONG_BLOCKED_MINUTES = "30";
        process.env.REDUCED_CODE_BLOCK_DURATION_MINUTES = "15";
        req.query.actionType = SecurityCodeErrorType.OtpMaxRetries;
        req.session.user.isAccountRecoveryJourney = true;
        securityCodeInvalidGet(req as Request, res as Response);
        expect(res.render).to.have.calledWith("security-code-error/index.njk", {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.RESEND_MFA_CODE,
            "isResendCodeRequest",
            "true"
          ),
          isAuthApp: false,
          isBlocked: true,
          show2HrScreen: false,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        });
        expect(req.session.user.wrongCodeEnteredLock).to.eq(
          "Mon, 01 Jan 2024 00:15:00 GMT"
        );
      }
    );

    it(
      "should render security-code-error/index.njk and set lock when user entered too many EMAIL OTPs " +
        "in the account recovery journey",
      () => {
        process.env.ACCOUNT_RECOVERY_CODE_ENTERED_WRONG_BLOCKED_MINUTES = "15";
        req.query.actionType =
          SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries;
        req.session.user.isAccountRecoveryJourney = true;
        securityCodeInvalidGet(req as Request, res as Response);
        expect(res.render).to.have.calledWith("security-code-error/index.njk", {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.RESEND_EMAIL_CODE,
            "requestNewCode",
            "true"
          ),
          isAuthApp: false,
          isBlocked: true,
          show2HrScreen: true,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        });
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
        expect(res.render).to.have.calledWith("security-code-error/index.njk", {
          newCodeLink: pathWithQueryParam(
            PATH_NAMES.RESEND_EMAIL_CODE,
            "requestNewCode",
            "true"
          ),
          isAuthApp: false,
          isBlocked: true,
          show2HrScreen: true,
          contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        });
        expect(req.session.user.wrongCodeEnteredPasswordResetLock).to.eq(
          "Mon, 01 Jan 2024 02:00:00 GMT"
        );
      }
    );

    it("should not reset unexpired locks", () => {
      [
        SecurityCodeErrorType.MfaMaxRetries,
        SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries,
        SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries,
        SecurityCodeErrorType.OtpMaxRetries,
      ].forEach((errorType) => {
        req.query.actionType = errorType;
        const dateInTheFuture = new Date(
          date.getTime() + 1 * 1000
        ).toUTCString();
        req.session.user.wrongCodeEnteredPasswordResetLock = dateInTheFuture;
        req.session.user.wrongCodeEnteredAccountRecoveryLock = dateInTheFuture;
        req.session.user.wrongCodeEnteredLock = dateInTheFuture;

        securityCodeInvalidGet(req as Request, res as Response);
        const locks = [
          req.session.user.wrongCodeEnteredPasswordResetLock,
          req.session.user.wrongCodeEnteredAccountRecoveryLock,
          req.session.user.wrongCodeEnteredLock,
        ];

        locks.forEach((lock) => {
          expect(lock).to.eq(dateInTheFuture);
        });
      });
    });
  });

  describe("securityCodeTriesExceededGet", () => {
    after(() => {
      delete process.env.CODE_REQUEST_BLOCKED_MINUTES;
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

            contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
            strategicAppChannel: res.locals.strategicAppChannel,
          }
        );
        expect(req.session.user.codeRequestLock).to.eq(
          "Mon, 01 Jan 2024 00:15:00 GMT"
        );
      }
    );

    it(
      "should render index-too-many-requests.njk for MfaMaxRetries when max number of codes have been sent " +
        "and user is in the sign-in journey",
      () => {
        req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;
        req.session.user.isPasswordResetJourney = true;
        res.locals.strategicAppChannel = true;

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
            contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
            strategicAppChannel: res.locals.strategicAppChannel,
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
        res.locals.strategicAppChannel = true;
        securityCodeTriesExceededGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith(
          "security-code-error/index-too-many-requests.njk",
          {
            newCodeLink: getNewCodePath(SecurityCodeErrorType.OtpBlocked),
            isResendCodeRequest: undefined,
            isAccountCreationJourney: undefined,

            contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
            strategicAppChannel: res.locals.strategicAppChannel,
          }
        );
      }
    );

    it("should render index-too-many-requests.njk for MfaMaxRetries when max number of codes have been sent and user is in the account creation journey", () => {
      req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;
      req.session.user.isAccountCreationJourney = true;
      res.locals.strategicAppChannel = true;
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

          contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
          strategicAppChannel: res.locals.strategicAppChannel,
        }
      );
    });

    it("should not extend a lock that already exists", () => {
      req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;

      const dateInTheFuture = new Date(date.getTime() + 1 * 1000).toUTCString();

      req.session.user.codeRequestLock = dateInTheFuture;

      securityCodeTriesExceededGet(req as Request, res as Response);

      expect(req.session.user.codeRequestLock).to.eq(dateInTheFuture);
    });
  });
});
