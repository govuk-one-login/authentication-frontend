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
import { SecurityCodeErrorType } from "../../common/constants";
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
    it("should render security code expired view", () => {
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.query.actionType = SecurityCodeErrorType.EmailMaxCodesSent;

      securityCodeInvalidGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("security-code-error/index.njk");
    });
  });

  describe("securityCodeTriesExceededGet", () => {
    it("should render security code requested too many times view", () => {
      req.query.actionType = SecurityCodeErrorType.EmailMaxCodesSent;

      securityCodeTriesExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk"
      );
    });
  });

  describe("securityCodeCannotRequestGet", () => {
    it("should render security code invalid request view", () => {
      req.query.actionType = SecurityCodeErrorType.EmailMaxCodesSent;

      securityCodeCannotRequestCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk"
      );
    });
  });

  describe("securityCodeEnteredExceededGet", () => {
    it("should render security code invalid request view when SMS code has been used max number of times", () => {
      req.query.actionType = SecurityCodeErrorType.MfaMaxRetries;

      securityCodeEnteredExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-security-code-entered-exceeded.njk",
        { newCodeLink: "/resend-code", isAuthApp: false }
      );
    });

    it("should render security code invalid request view when Auth App code has been used max number of times", () => {
      req.query.actionType = SecurityCodeErrorType.AuthAppMfaMaxRetries;

      securityCodeEnteredExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-security-code-entered-exceeded.njk",
        { newCodeLink: "/enter-authenticator-app-code", isAuthApp: true }
      );
    });
  });
});
