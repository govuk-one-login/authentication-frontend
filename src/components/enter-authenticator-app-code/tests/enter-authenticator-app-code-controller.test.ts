import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME,
  enterAuthenticatorAppCodeGet,
  enterAuthenticatorAppCodePost,
  UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME,
} from "../enter-authenticator-app-code-controller";
import { PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { AccountRecoveryInterface } from "../../common/account-recovery/types";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { VerifyMfaCodeInterface } from "../types";

describe("enter authenticator app code controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      i18n: { language: "en" },
    });
    res = mockResponse();
    process.env.SUPPORT_ACCOUNT_RECOVERY = "1";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("enterAuthenticatorAppCodeGet", () => {
    it("should render enter mfa code view with isAccountRecoveryPermitted true when user is permitted to perform account recovery and account recovery is enabled for environment", async () => {
      const fakeService: AccountRecoveryInterface = {
        accountRecovery: sinon.fake.returns({
          success: true,
          data: {
            accountRecoveryPermitted: true,
          },
        }),
      } as unknown as AccountRecoveryInterface;

      await enterAuthenticatorAppCodeGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "enter-authenticator-app-code/index.njk",
        {
          isAccountRecoveryPermitted: true,
          checkEmailLink:
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES +
            "?type=AUTH_APP",
        }
      );
    });

    it("should render enter mfa code view with isAccountRecoveryPermitted false when user is not permitted to perform account recovery", async () => {
      const fakeService: AccountRecoveryInterface = {
        accountRecovery: sinon.fake.returns({
          success: true,
          data: {
            accountRecoveryPermitted: false,
          },
        }),
      } as unknown as AccountRecoveryInterface;

      await enterAuthenticatorAppCodeGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "enter-authenticator-app-code/index.njk",
        {
          isAccountRecoveryPermitted: false,
          checkEmailLink:
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES +
            "?type=AUTH_APP",
        }
      );
    });

    it("should render enter mfa code view with isAccountRecoveryPermitted false when account recovery is disable for the environment", async () => {
      process.env.SUPPORT_ACCOUNT_RECOVERY = "0";
      const fakeService: AccountRecoveryInterface = {
        accountRecovery: sinon.fake.returns({
          success: true,
          data: {
            accountRecoveryPermitted: true,
          },
        }),
      } as unknown as AccountRecoveryInterface;

      await enterAuthenticatorAppCodeGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "enter-authenticator-app-code/index.njk",
        {
          isAccountRecoveryPermitted: false,
        }
      );
    });

    it("should render 2fa service uplift view when uplift is required ", async () => {
      req.session.user.isUpliftRequired = true;

      const fakeService: AccountRecoveryInterface = {
        accountRecovery: sinon.fake.returns({
          success: true,
          data: {
            accountRecoveryPermitted: true,
          },
        }),
      } as unknown as AccountRecoveryInterface;

      await enterAuthenticatorAppCodeGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME,
        {
          isAccountRecoveryPermitted: true,
          checkEmailLink:
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES +
            "?type=AUTH_APP",
        }
      );
    });

    it("should render default template when uplift is not required", async () => {
      req.session.user.isUpliftRequired = false;

      const fakeService: AccountRecoveryInterface = {
        accountRecovery: sinon.fake.returns({
          success: true,
          data: {
            accountRecoveryPermitted: true,
          },
        }),
      } as unknown as AccountRecoveryInterface;

      await enterAuthenticatorAppCodeGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME,
        {
          isAccountRecoveryPermitted: true,
          checkEmailLink:
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES +
            "?type=AUTH_APP",
        }
      );
    });
  });

  describe("enterAuthenticatorAppCodePost", () => {
    it("should redirect to /auth-code when valid code entered", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyMfaCodeInterface;

      req.body.code = "123456";
      res.locals.sessionId = "123456-djjad";

      await enterAuthenticatorAppCodePost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should return error when invalid code entered", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.AUTH_APP_INVALID_CODE,
            message: "",
          },
        }),
      } as unknown as VerifyMfaCodeInterface;

      req.t = sinon.fake.returns("translated string");
      req.body.code = "678988";
      res.locals.sessionId = "123456-djjad";

      await enterAuthenticatorAppCodePost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith(
        "enter-authenticator-app-code/index.njk"
      );
    });

    it("should redirect to security code expired when invalid authenticator app code entered more than max retries", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          data: {
            code: ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED,
            message: "",
          },
          success: false,
        }),
      } as unknown as VerifyMfaCodeInterface;

      req.t = sinon.fake.returns("translated string");
      req.body.code = "678988";
      res.locals.sessionId = "123456-djjad";

      await enterAuthenticatorAppCodePost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith(
        `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=authAppMfaMaxRetries`
      );
    });
  });
});
