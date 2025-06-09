import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import {
  ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME,
  enterAuthenticatorAppCodeGet,
  enterAuthenticatorAppCodePost,
  UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME,
} from "../enter-authenticator-app-code-controller.js";
import { JOURNEY_TYPE, PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES } from "../../common/constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import type { VerifyMfaCodeInterface } from "../types.js";
import * as journey from "../../common/journey/journey.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import esmock from "esmock";
import { fakeAccountRecoveryService } from "../../common/account-recovery/tests/account-recovery-helper.test.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

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
    res.render = sinon.spy(res.render);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("enterAuthenticatorAppCodeGet", () => {
    it("should render enter mfa code view with isAccountRecoveryPermitted true when user is permitted to perform account recovery", async () => {
      await enterAuthenticatorAppCodeGet(fakeAccountRecoveryService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "enter-authenticator-app-code/index.njk",
        {
          isAccountRecoveryPermitted: true,
          hasMultipleMfaMethods: false,
          mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
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
          hasMultipleMfaMethods: false,
          mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
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
          hasMultipleMfaMethods: false,
          mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
        }
      );
    });

    it("should render 2fa service uplift view with hasMultipleMfaMethods true when user has multiple MFAs", async () => {
      req.session.user.isUpliftRequired = true;
      req.session.user.mfaMethods = buildMfaMethods([
        { authApp: true },
        { authApp: false },
      ]);

      await enterAuthenticatorAppCodeGet(fakeAccountRecoveryService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME,
        {
          isAccountRecoveryPermitted: true,
          hasMultipleMfaMethods: true,
          mfaIssuePath: PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
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
          hasMultipleMfaMethods: false,
          mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
        }
      );
    });
  });

  describe("enterAuthenticatorAppCodePost", () => {
    it("can send the journeyType when verifying the code", async () => {
      const fakeService = fakeVerifyMfaCodeService();

      const getJourneyTypeFromUserSessionSpy = sinon.spy(
        journey.getJourneyTypeFromUserSession
      );

      req.body.code = "123456";
      res.locals.sessionId = "123456-djjad";

      const {
        enterAuthenticatorAppCodePost: mockEnterAuthenticatorAppCodePost,
      } = await esmock("../enter-authenticator-app-code-controller.js", {
        "../../common/journey/journey.js": {
          getJourneyTypeFromUserSession: getJourneyTypeFromUserSessionSpy,
        },
      });

      await mockEnterAuthenticatorAppCodePost(fakeService)(
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
      req.session.user.isAccountRecoveryPermitted = true;
      req.session.user.mfaMethods = [{}];

      await enterAuthenticatorAppCodePost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith(
        "enter-authenticator-app-code/index.njk",
        sinon.match({
          isAccountRecoveryPermitted: true,
          hasMultipleMfaMethods: false,
          mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
        })
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
