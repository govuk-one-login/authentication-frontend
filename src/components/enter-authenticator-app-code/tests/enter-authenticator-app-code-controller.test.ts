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
import { JOURNEY_TYPE, PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { AccountRecoveryInterface } from "../../common/account-recovery/types";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { VerifyMfaCodeInterface } from "../types";
import * as journey from "../../common/journey/journey";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

const fakeAccountRecoveryService = (accountRecoveryPermitted: boolean) => {
  return {
    accountRecovery: sinon.fake.returns({
      success: true,
      data: {
        accountRecoveryPermitted: accountRecoveryPermitted,
      },
    }),
  } as unknown as AccountRecoveryInterface;
};

const fakeVerifyMfaCodeService = (errorCode?: number) => {
  return {
    verifyMfaCode: sinon.fake.returns({
      success: errorCode === undefined,
      data:
        errorCode !== undefined
          ? {
              code: errorCode,
              message: "",
            }
          : null,
    }),
  } as unknown as VerifyMfaCodeInterface;
};

describe("enter authenticator app code controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE);
    res = mockResponse();
    process.env.SUPPORT_ACCOUNT_RECOVERY = "1";
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
    delete process.env.ROUTE_USERS_TO_NEW_IPV_JOURNEY;
  });

  describe("enterAuthenticatorAppCodeGet", () => {
    it("should render enter mfa code view with isAccountRecoveryPermitted true when user is permitted to perform account recovery, account recovery is enabled for environment and mfa reset with ipv is not enabled", async () => {
      process.env.SUPPORT_MFA_RESET_WITH_IPV = "0";

      await enterAuthenticatorAppCodeGet(fakeAccountRecoveryService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "enter-authenticator-app-code/index.njk",
        {
          isAccountRecoveryPermitted: true,
          routeUserViaIpvReset: false,
          mfaResetPath:
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES +
            "?type=AUTH_APP",
        }
      );
    });

    it("should render enter mfa code view with isAccountRecoveryPermitted false when user is not permitted to perform account recovery", async () => {
      await enterAuthenticatorAppCodeGet(fakeAccountRecoveryService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "enter-authenticator-app-code/index.njk",
        {
          isAccountRecoveryPermitted: false,
          routeUserViaIpvReset: false,
          mfaResetPath:
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES +
            "?type=AUTH_APP",
        }
      );
    });

    it("should render enter mfa code view with isAccountRecoveryPermitted false when account recovery is disable for the environment", async () => {
      process.env.SUPPORT_ACCOUNT_RECOVERY = "0";

      await enterAuthenticatorAppCodeGet(fakeAccountRecoveryService(true))(
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

      await enterAuthenticatorAppCodeGet(fakeAccountRecoveryService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME,
        {
          isAccountRecoveryPermitted: true,
          routeUserViaIpvReset: false,
          mfaResetPath:
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES +
            "?type=AUTH_APP",
        }
      );
    });

    it("should render default template when uplift is not required", async () => {
      req.session.user.isUpliftRequired = false;

      await enterAuthenticatorAppCodeGet(fakeAccountRecoveryService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME,
        {
          isAccountRecoveryPermitted: true,
          routeUserViaIpvReset: false,
          mfaResetPath:
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES +
            "?type=AUTH_APP",
        }
      );
    });

    it("should render enter authenticator app code view with mfaResetPath being IPV_DUMMY_URL when mfa reset with ipv is supported", async () => {
      process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";
      process.env.ROUTE_USERS_TO_NEW_IPV_JOURNEY = "1";

      await enterAuthenticatorAppCodeGet(fakeAccountRecoveryService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "enter-authenticator-app-code/index.njk",
        {
          isAccountRecoveryPermitted: true,
          routeUserViaIpvReset: true,
          mfaResetPath: PATH_NAMES.MFA_RESET_WITH_IPV,
        }
      );
    });
  });

  describe("enterAuthenticatorAppCodePost", () => {
    it("can send the journeyType when verifying the code", async () => {
      const fakeService = fakeVerifyMfaCodeService();

      const getJourneyTypeFromUserSessionSpy = sinon.spy(
        journey,
        "getJourneyTypeFromUserSession"
      );

      req.body.code = "123456";
      res.locals.sessionId = "123456-djjad";

      await enterAuthenticatorAppCodePost(fakeService)(
        req as Request,
        res as Response
      );

      expect(
        getJourneyTypeFromUserSessionSpy
      ).to.have.been.calledOnceWithExactly(req.session.user, {
        includeAccountRecovery: true,
        includeReauthentication: true,
        fallbackJourneyType: JOURNEY_TYPE.SIGN_IN,
      });
      expect(getJourneyTypeFromUserSessionSpy.getCall(0).returnValue).to.equal(
        JOURNEY_TYPE.SIGN_IN
      );
      expect(fakeService.verifyMfaCode).to.have.been.calledOnceWithExactly(
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        JOURNEY_TYPE.SIGN_IN
      );
    });

    it("should redirect to /auth-code when valid code entered", async () => {
      const fakeService = fakeVerifyMfaCodeService();

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
      const fakeService = fakeVerifyMfaCodeService(
        ERROR_CODES.AUTH_APP_INVALID_CODE
      );

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
      const fakeService = fakeVerifyMfaCodeService(
        ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED
      );

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

    it("should redirect to orchestration with error require login reauth journey than max retries", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
      const fakeService = fakeVerifyMfaCodeService(
        ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED
      );

      req.t = sinon.fake.returns("translated string");
      req.body.code = "678988";
      res.locals.sessionId = "123456-djjad";
      req.session.user.reauthenticate = "reauth";
      req.session.client.redirectUri = "https://rp.gov.uk/redirect";

      await enterAuthenticatorAppCodePost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith(
        `https://rp.gov.uk/redirect?error=login_required`
      );
    });

    it("should redirect to orchestration with error required login reauth journey on reauth sign in details exceeded", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
      const fakeService = fakeVerifyMfaCodeService(
        ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED
      );

      req.t = sinon.fake.returns("translated string");
      req.body.code = "678988";
      res.locals.sessionId = "123456-djjad";
      req.session.user.reauthenticate = "reauth";
      req.session.client.redirectUri = "https://rp.gov.uk/redirect";

      await enterAuthenticatorAppCodePost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith(
        `https://rp.gov.uk/redirect?error=login_required`
      );
    });
  });
});
