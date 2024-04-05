import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants";
import {
  resetPassword2FAAuthAppGet,
  resetPassword2FAAuthAppPost,
} from "../reset-password-2fa-auth-app-controller";
import { VerifyMfaCodeInterface } from "../../enter-authenticator-app-code/types";
import { ERROR_CODES } from "../../common/constants";

describe("reset password 2fa auth app controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
    res.locals.sessionId = "s-123456-djjad";
    process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "0";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPassword2FAAuthAppGet", () => {
    it("should render reset password auth app view", async () => {
      req.session.user = {
        email: "joe.bloggs@test.com",
      };

      await resetPassword2FAAuthAppGet()(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "reset-password-2fa-auth-app/index.njk"
      );
    });
  });

  describe("resetPassword2FAAuthAppPost", () => {
    it("should redirect to reset-password if code entered is correct and feature flag is turned on", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyMfaCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.session.user.enterEmailMfaType = "AUTH-APP";
      req.body.code = "123456";
      req.session.id = "123456-djjad";

      await resetPassword2FAAuthAppPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("should render check email page with errors if incorrect code entered", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.AUTH_APP_INVALID_CODE,
          },
        }),
      } as unknown as VerifyMfaCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.session.user.enterEmailMfaType = "AUTH-APP";
      req.body.code = "123456";
      req.session.id = "123456-djjad";

      await resetPassword2FAAuthAppPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "reset-password-2fa-auth-app/index.njk"
      );
    });

    it("should render security-code-error/index-security-code-entered-exceeded.njk when user was locked out in the current session for requesting too many security codes", async () => {
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      req.session.user.wrongCodeEnteredPasswordResetMfaLock =
        tomorrow.toUTCString();

      await resetPassword2FAAuthAppGet()(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-security-code-entered-exceeded.njk"
      );
    });
  });
});
