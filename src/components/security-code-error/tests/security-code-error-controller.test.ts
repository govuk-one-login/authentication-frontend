import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  securityCodeCannotRequestCodeGet,
  securityCodeInvalidGet,
  securityCodeTriesExceededGet,
  securityCodeEnteredExceededGet,
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

describe("security code  controller", () => {
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
    it("should render invalid OTP code for EmailMaxRetries error when email OTP code has been invalid max number of times", () => {
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
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
      });
    });

    it("should render invalid OTP code for MfaMaxRetries error when email OTP code has been invalid max number of times", () => {
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;

      securityCodeInvalidGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("security-code-error/index.njk", {
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
          SECURITY_CODE_ERROR,
          SecurityCodeErrorType.MfaMaxRetries
        ),
        isAuthApp: false,
        isBlocked: true,
      });
    });

    it("should render invalid OTP code for AuthAppMfaMaxRetries error when email OTP code has been invalid max number of times", () => {
      req.query.actionType = SecurityCodeErrorType.AuthAppMfaMaxRetries;

      securityCodeInvalidGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("security-code-error/index.njk", {
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
          SECURITY_CODE_ERROR,
          SecurityCodeErrorType.AuthAppMfaMaxRetries
        ),
        isAuthApp: true,
        isBlocked: true,
      });
    });

    it("should render invalid OTP code for OtpMaxRetries error when email OTP code has been invalid max number of times", () => {
      req.query.actionType = SecurityCodeErrorType.OtpMaxRetries;

      securityCodeInvalidGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("security-code-error/index.njk", {
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.RESEND_MFA_CODE,
          "isResendCodeRequest",
          "true"
        ),
        isAuthApp: false,
        isBlocked: true,
      });
    });
  });

  describe("securityCodeTriesExceededGet", () => {
    it("should render index-too-many-requests.njk for EmailMaxCodesSent when max number of codes have been sent", () => {
      req.query.actionType = SecurityCodeErrorType.EmailMaxCodesSent;

      securityCodeTriesExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk",
        {
          newCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
          isResendCodeRequest: undefined,
        }
      );
    });

    it("should render index-too-many-requests.njk for MfaMaxRetries when max number of codes have been sent", () => {
      req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;

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
        }
      );
    });

    it("should render index-too-many-requests.njk for OtpMaxCodesSent when max number of codes have been sent", () => {
      req.query.actionType = SecurityCodeErrorType.OtpMaxCodesSent;

      securityCodeTriesExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk",
        {
          newCodeLink: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
          isResendCodeRequest: undefined,
        }
      );
    });
  });

  describe("securityCodeCannotRequestGet", () => {
    it("should render index-too-many-requests.njk for OtpBlocked when user is blocked from requesting anymore OTPs", () => {
      req.query.actionType = SecurityCodeErrorType.OtpBlocked;

      securityCodeCannotRequestCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk",
        {
          newCodeLink: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
        }
      );
    });

    it("should render index-too-many-requests.njk for MfaBlocked when user is blocked from requesting anymore OTPs", () => {
      req.query.actionType = SecurityCodeErrorType.MfaBlocked;

      securityCodeCannotRequestCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk",
        {
          newCodeLink: PATH_NAMES.RESEND_MFA_CODE,
        }
      );
    });

    it("should render index-too-many-requests.njk for MfaBlocked when user is blocked from requesting anymore OTPs", () => {
      req.query.actionType = SecurityCodeErrorType.EmailBlocked;

      securityCodeCannotRequestCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk",
        {
          newCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
        }
      );
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
});
