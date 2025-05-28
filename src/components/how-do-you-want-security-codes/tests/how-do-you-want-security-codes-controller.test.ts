import { describe } from "mocha";
import type { Request, Response } from "express";
import { expect } from "chai";
import { strict as assert } from "assert";
import {
  howDoYouWantSecurityCodesGet,
  howDoYouWantSecurityCodesPost,
} from "../how-do-you-want-security-codes-controller.js";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import { BadRequestError } from "../../../utils/error.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

describe("how do you want security codes controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("howDoYouWantSecurityCodesGet", () => {
    it("should render the how do you want security codes page", () => {
      howDoYouWantSecurityCodesGet(req as Request, res as Response);
      expect(res.render).to.have.calledWith(
        "how-do-you-want-security-codes/index.njk"
      );
    });

    it("should render reset password auth app view with supportMfaReset false when completing a password reset journey", () => {
      req.session.user.isPasswordResetJourney = true;

      howDoYouWantSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "how-do-you-want-security-codes/index.njk",
        {
          mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
          mfaMethods: [],
          supportMfaReset: false,
        }
      );
    });

    it("should render reset password auth app view with supportMfaReset true when not completing a password reset journey", () => {
      req.session.user.isPasswordResetJourney = false;

      howDoYouWantSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "how-do-you-want-security-codes/index.njk",
        {
          mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
          mfaMethods: [],
          supportMfaReset: true,
        }
      );
    });
  });

  describe("howDoYouWantSecurityCodesPost", () => {
    it("should throw error if the user has no MFA methods", async () => {
      req.session.user.mfaMethods = [];

      await assert.rejects(
        async () => howDoYouWantSecurityCodesPost(req, res),
        BadRequestError,
        "No MFA methods found"
      );
    });

    it("should redirect to /enter-authenticator-app-code if 'authenticator app' is selected", async () => {
      req.body["mfa-method-id"] = "testAuthApp";
      req.session.user.mfaMethods = buildMfaMethods([
        {
          id: "testPhone",
          redactedPhoneNumber: "07000000000",
        },
        { id: "testAuthApp", authApp: true },
      ]);

      await howDoYouWantSecurityCodesPost(req, res);

      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
      );
    });
  });
});
