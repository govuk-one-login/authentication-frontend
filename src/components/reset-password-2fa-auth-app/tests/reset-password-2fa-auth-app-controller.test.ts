import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants.js";
import {
  resetPassword2FAAuthAppGet,
  resetPassword2FAAuthAppPost,
} from "../reset-password-2fa-auth-app-controller.js";
import type { VerifyMfaCodeInterface } from "../../enter-authenticator-app-code/types.js";
import { ERROR_CODES } from "../../common/constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

const TEST_REDACTED_PHONE_NUMBER = "777";

describe("reset password 2fa auth app controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP);
    req.session.user = { email: commonVariables.email };
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPassword2FAAuthAppGet", () => {
    it("should render reset password auth app view", async () => {
      await resetPassword2FAAuthAppGet()(req as Request, res as Response);

      expect(res.render).to.have.calledWith("reset-password-2fa-auth-app/index.njk");
    });

    it("should render reset password auth app view with hasMultipleMfaMethods false when user has a single mfa method", async () => {
      req.session.user = {
        email: "joe.bloggs@test.com",
        mfaMethods: buildMfaMethods([
          { redactedPhoneNumber: TEST_REDACTED_PHONE_NUMBER },
        ]),
      };

      await resetPassword2FAAuthAppGet()(req as Request, res as Response);

      expect(res.render).to.have.calledWith("reset-password-2fa-auth-app/index.njk", {
        hasMultipleMfaMethods: false,
        chooseMfaMethodHref: PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
      });
    });

    it("should render reset password auth app view with hasMultipleMfaMethods true when user has more than one mfa method", async () => {
      req.session.user = {
        email: "joe.bloggs@test.com",
        mfaMethods: buildMfaMethods([
          { redactedPhoneNumber: TEST_REDACTED_PHONE_NUMBER },
          { authApp: true },
        ]),
      };

      await resetPassword2FAAuthAppGet()(req as Request, res as Response);

      expect(res.render).to.have.calledWith("reset-password-2fa-auth-app/index.njk", {
        hasMultipleMfaMethods: true,
        chooseMfaMethodHref: PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
      });
    });
  });

  describe("resetPassword2FAAuthAppPost", () => {
    it("should redirect to reset-password if code entered is correct", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({ success: true }),
      } as unknown as VerifyMfaCodeInterface;
      req.session.user.enterEmailMfaType = "AUTH-APP";
      req.body.code = "123456";

      await resetPassword2FAAuthAppPost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("should render check email page with errors if incorrect code entered", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: false,
          data: { code: ERROR_CODES.AUTH_APP_INVALID_CODE },
        }),
      } as unknown as VerifyMfaCodeInterface;
      req.session.user.enterEmailMfaType = "AUTH-APP";
      req.body.code = "123456";

      await resetPassword2FAAuthAppPost(fakeService)(req as Request, res as Response);

      expect(res.render).to.have.calledWith("reset-password-2fa-auth-app/index.njk");
    });

    it("should render security-code-error/index-security-code-entered-exceeded.njk when user was locked out in the current session for requesting too many security codes", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      req.session.user.wrongCodeEnteredPasswordResetMfaLock = tomorrow.toUTCString();

      await resetPassword2FAAuthAppGet()(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-security-code-entered-exceeded.njk"
      );
    });
  });
});
