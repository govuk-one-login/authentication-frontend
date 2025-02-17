import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  ENTER_MFA_DEFAULT_TEMPLATE_NAME,
  enterMfaGet,
  enterMfaPost,
  UPLIFT_REQUIRED_SMS_TEMPLATE_NAME,
} from "../enter-mfa-controller";

import { VerifyCodeInterface } from "../../common/verify-code/types";
import { AccountRecoveryInterface } from "../../common/account-recovery/types";
import { JOURNEY_TYPE, PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import * as journey from "../../common/journey/journey";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { getPermittedJourneyForPath } from "../../../utils/session";

const TEST_PHONE_NUMBER = "07582930495";

const fakeAccountRecoveryPermissionCheckService = (
  desiredAccountRecoveryPermittedResponse: boolean
) => {
  return {
    accountRecovery: sinon.fake.returns({
      success: true,
      data: {
        accountRecoveryPermitted: desiredAccountRecoveryPermittedResponse,
      },
    }),
  } as unknown as AccountRecoveryInterface;
};

describe("enter mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ENTER_MFA);
    req.session.user = {
      journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
      redactedPhoneNumber: TEST_PHONE_NUMBER,
    };
    res = mockResponse();
    process.env.SUPPORT_ACCOUNT_RECOVERY = "1";
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
  });

  describe("enterMfaGet", () => {
    it("should render enter mfa code view with supportAccountRecovery false when disabled at environment level", async () => {
      process.env.SUPPORT_ACCOUNT_RECOVERY = "0";
      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("enter-mfa/index.njk", {
        phoneNumber: TEST_PHONE_NUMBER,
        supportAccountRecovery: false,
      });
    });

    it("should render enter mfa code view with supportAccountRecovery false when enabled at environment level, but user is blocked from account recovery", async () => {
      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("enter-mfa/index.njk", {
        phoneNumber: TEST_PHONE_NUMBER,
        supportAccountRecovery: false,
        mfaResetPath:
          PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS",
        supportMfaResetWithIpv: false,
      });
    });

    it("should render enter mfa code view with supportAccountRecovery true when enabled at environment level and user is not blocked from account recovery and mfa reset with ipv is not supported", async () => {
      process.env.SUPPORT_MFA_RESET_WITH_IPV = "0";

      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("enter-mfa/index.njk", {
        phoneNumber: TEST_PHONE_NUMBER,
        supportAccountRecovery: true,
        mfaResetPath:
          PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS",
        supportMfaResetWithIpv: false,
      });
    });

    it("should render 2fa service uplift view when uplift is required", async () => {
      req.session.user.isUpliftRequired = true;
      process.env.SUPPORT_ACCOUNT_RECOVERY = "0";

      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(UPLIFT_REQUIRED_SMS_TEMPLATE_NAME, {
        phoneNumber: TEST_PHONE_NUMBER,
        supportAccountRecovery: false,
      });
    });

    it("should render default template when uplift is not required", async () => {
      req.session.user.isUpliftRequired = false;
      process.env.SUPPORT_ACCOUNT_RECOVERY = "0";

      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(ENTER_MFA_DEFAULT_TEMPLATE_NAME, {
        phoneNumber: TEST_PHONE_NUMBER,
        supportAccountRecovery: false,
      });
    });

    it("should render index-wait when user is locked out in the current session for too many requested codes", async () => {
      req.session.user.isUpliftRequired = false;
      process.env.SUPPORT_ACCOUNT_RECOVERY = "0";
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      req.session.user.codeRequestLock = tomorrow.toUTCString();
      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });

    it("should render enter mfa code view with mfaResetPath being IPV_DUMMY_URL when mfa reset with ipv is supported", async () => {
      process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";

      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("enter-mfa/index.njk", {
        phoneNumber: TEST_PHONE_NUMBER,
        supportAccountRecovery: true,
        mfaResetPath: PATH_NAMES.MFA_RESET_WITH_IPV,
        supportMfaResetWithIpv: true,
      });
    });
  });

  describe("enterMfaPost", () => {
    it("can send the journeyType when verifying the code", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      const getJourneyTypeFromUserSessionSpy = sinon.spy(
        journey,
        "getJourneyTypeFromUserSession"
      );

      req.body.code = "123456";
      req.session.user.reauthenticate = "test_data";
      req.session.user.email = "test@test.com";

      await enterMfaPost(fakeService)(req as Request, res as Response);

      expect(
        getJourneyTypeFromUserSessionSpy
      ).to.have.been.calledOnceWithExactly(req.session.user, {
        includeReauthentication: true,
      });
      expect(getJourneyTypeFromUserSessionSpy.getCall(0).returnValue).to.equal(
        JOURNEY_TYPE.REAUTHENTICATION
      );
      expect(fakeService.verifyCode).to.have.been.calledOnceWithExactly(
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        JOURNEY_TYPE.REAUTHENTICATION
      );
    });

    it("should redirect to /auth-code when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      req.body.code = "123456";
      req.session.user.email = "test@test.com";

      await enterMfaPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
      expect(req.session.user.isAccountPartCreated).to.be.eq(false);
    });

    it("should return error when invalid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: false,
          data: { code: ERROR_CODES.INVALID_MFA_CODE, message: "" },
        }),
      } as unknown as VerifyCodeInterface;

      req.t = sinon.fake.returns("translated string");
      req.body.code = "678988";
      req.session.user.email = "test@test.com";

      await enterMfaPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith("enter-mfa/index.njk");
    });

    it("should redirect to security code expired when invalid code entered more than max retries", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          data: {
            code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES,
            message: "",
          },
          success: false,
        }),
      } as unknown as VerifyCodeInterface;

      req.t = sinon.fake.returns("translated string");
      req.body.code = "678988";
      req.session.user.email = "test@test.com";

      await enterMfaPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith(
        `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=mfaMaxRetries`
      );
    });
  });
});
