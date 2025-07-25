import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import {
  ENTER_MFA_DEFAULT_TEMPLATE_NAME,
  enterMfaGet,
  enterMfaPost,
  UPLIFT_REQUIRED_SMS_TEMPLATE_NAME,
} from "../enter-mfa-controller.js";
import type { VerifyCodeInterface } from "../../common/verify-code/types.js";
import type { AccountRecoveryInterface } from "../../common/account-recovery/types.js";
import { JOURNEY_TYPE, PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES } from "../../common/constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import * as journey from "../../common/journey/journey.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import esmock from "esmock";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

const TEST_PHONE_NUMBER = "07582930495";
const TEST_BACKUP_PHONE_NUMER = "07123456789";
const TEST_DEFAULT_MFA_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7";
const TEST_BACKUP_MFA_ID = "a1b2c3d4-e5f6-7890-1234-567890abcdef";

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
    req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
    res = mockResponse();

    req.session.user.mfaMethods = buildMfaMethods({
      id: TEST_DEFAULT_MFA_ID,
      redactedPhoneNumber: TEST_PHONE_NUMBER,
    });
    res.render = sinon.spy(res.render);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("enterMfaGet", () => {
    it("should render enter mfa code view with isAccountRecoveryPermitted false when user is blocked from account recovery", async () => {
      req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("enter-mfa/index.njk", {
        phoneNumber: TEST_PHONE_NUMBER,
        isAccountRecoveryPermitted: false,
        hasMultipleMfaMethods: false,
        mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
      });
    });

    it("should render enter mfa code view with isAccountRecoveryPermitted true when user is not blocked from account recovery", async () => {
      req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(true))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("enter-mfa/index.njk", {
        phoneNumber: TEST_PHONE_NUMBER,
        isAccountRecoveryPermitted: true,
        hasMultipleMfaMethods: false,
        mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
      });
    });

    it("should render 2fa service uplift view when uplift is required", async () => {
      req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
      req.session.user.isUpliftRequired = true;

      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(UPLIFT_REQUIRED_SMS_TEMPLATE_NAME, {
        phoneNumber: TEST_PHONE_NUMBER,
        isAccountRecoveryPermitted: false,
        hasMultipleMfaMethods: false,
        mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
      });
    });

    it("should render 2fa service uplift view with hasMultipleMfaMethods true when user has multiple MFAs", async () => {
      req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
      req.session.user.isUpliftRequired = true;
      req.session.user.mfaMethods = buildMfaMethods([
        { id: TEST_DEFAULT_MFA_ID, redactedPhoneNumber: TEST_PHONE_NUMBER },
        {
          id: TEST_BACKUP_MFA_ID,
          redactedPhoneNumber: TEST_BACKUP_PHONE_NUMER,
        },
      ]);

      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(UPLIFT_REQUIRED_SMS_TEMPLATE_NAME, {
        phoneNumber: TEST_PHONE_NUMBER,
        isAccountRecoveryPermitted: false,
        hasMultipleMfaMethods: true,
        mfaIssuePath: PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
      });
    });

    it("should render default template when uplift is not required", async () => {
      req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
      req.session.user.isUpliftRequired = false;

      await enterMfaGet(fakeAccountRecoveryPermissionCheckService(false))(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(ENTER_MFA_DEFAULT_TEMPLATE_NAME, {
        phoneNumber: TEST_PHONE_NUMBER,
        isAccountRecoveryPermitted: false,
        hasMultipleMfaMethods: false,
        mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
      });
    });

    it("should render index-wait when user is locked out in the current session for too many requested codes", async () => {
      req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
      req.session.user.isUpliftRequired = false;
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
  });

  describe("enterMfaPost", () => {
    it("can send the journeyType when verifying the code", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      const getJourneyTypeFromUserSessionSpy = sinon.spy(
        journey.getJourneyTypeFromUserSession
      );

      req.body.code = "123456";
      req.session.user.reauthenticate = "test_data";
      req.session.user.email = "test@test.com";

      const { enterMfaPost: mockEnterMfaPost } = await esmock(
        "../enter-mfa-controller.js",
        {
          "../../common/journey/journey.js": {
            getJourneyTypeFromUserSession: getJourneyTypeFromUserSessionSpy,
          },
        }
      );

      await mockEnterMfaPost(fakeService)(req as Request, res as Response);

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
        TEST_DEFAULT_MFA_ID,
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
      req.session.user.isAccountRecoveryPermitted = true;

      await enterMfaPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith(
        "enter-mfa/index.njk",
        sinon.match({
          isAccountRecoveryPermitted: true,
          hasMultipleMfaMethods: false,
          mfaIssuePath: PATH_NAMES.MFA_RESET_WITH_IPV,
        })
      );
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
