import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import { JOURNEY_TYPE, NOTIFICATION_TYPE, PATH_NAMES } from "../../../app.constants.js";
import {
  setupAuthenticatorAppGet,
  setupAuthenticatorAppPost,
} from "../setup-authenticator-app-controller.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { ERROR_CODES } from "../../common/constants.js";
import { BadRequestError } from "../../../utils/error.js";
import type { SendNotificationServiceInterface } from "../../common/send-notification/types.js";
import type { VerifyMfaCodeInterface } from "../../enter-authenticator-app-code/types.js";
import * as journey from "../../common/journey/journey.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { strict as assert } from "assert";
import esmock from "esmock";

describe("setup-authenticator-app controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("setupAuthenticatorAppGet", () => {
    it("should render setup-authenticator page", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";

      await setupAuthenticatorAppGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("setup-authenticator-app/index.njk");
    });
  });

  describe("setupAuthenticatorAppPost", () => {
    let fakeNotificationService: SendNotificationServiceInterface;

    beforeEach(() => {
      fakeNotificationService = { sendNotification: sinon.fake() };
    });

    it("can send the journeyType when sending the MFA code", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.session.user.isAccountRecoveryPermitted = true;
      req.session.user.isAccountRecoveryJourney = true;
      req.body.code = "123456";

      const fakeMfAService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({ success: true }),
      } as unknown as VerifyMfaCodeInterface;

      const getJourneyTypeFromUserSessionSpy = sinon.spy(
        journey.getJourneyTypeFromUserSession
      );

      const { setupAuthenticatorAppPost: mockSetupAuthenticatorAppPost } = await esmock(
        "../setup-authenticator-app-controller.js",
        {
          "../../common/journey/journey.js": {
            getJourneyTypeFromUserSession: getJourneyTypeFromUserSessionSpy,
          },
        }
      );

      await mockSetupAuthenticatorAppPost(fakeMfAService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(getJourneyTypeFromUserSessionSpy).to.have.been.calledOnceWithExactly(
        req.session.user,
        {
          includeAccountRecovery: true,
          fallbackJourneyType: JOURNEY_TYPE.REGISTRATION,
        }
      );
      expect(getJourneyTypeFromUserSessionSpy.getCall(0).returnValue).to.equal(
        JOURNEY_TYPE.ACCOUNT_RECOVERY
      );
      expect(fakeMfAService.verifyMfaCode).to.have.been.calledOnceWithExactly(
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        JOURNEY_TYPE.ACCOUNT_RECOVERY,
        sinon.match.any
      );
    });

    it("should successfully validate access code and redirect to account created", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.body.code = "123456";

      const fakeMfAService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({ success: true }),
      } as unknown as VerifyMfaCodeInterface;

      await setupAuthenticatorAppPost(fakeMfAService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeMfAService.verifyMfaCode).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.calledOnceWith(
        undefined,
        undefined,
        "t@t.com",
        NOTIFICATION_TYPE.ACCOUNT_CREATED_CONFIRMATION,
        undefined,
        "",
        req
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL);
    });

    it("should successfully validate access code and redirect to account created for account recovery journey (to be updated)", async () => {
      req.body.code = "123456";
      req.session.user = {
        authAppSecret: "testsecret",
        email: "t@t.com",
        isAccountRecoveryPermitted: true,
        isAccountRecoveryJourney: true,
      };

      const fakeMfAService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({ success: true }),
      } as unknown as VerifyMfaCodeInterface;

      await setupAuthenticatorAppPost(fakeMfAService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeMfAService.verifyMfaCode).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.calledOnceWith(
        undefined,
        undefined,
        "t@t.com",
        NOTIFICATION_TYPE.CHANGE_HOW_GET_SECURITY_CODES_CONFIRMATION,
        undefined,
        "",
        req
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION
      );
    });

    it("should return validation error when incorrect code", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.body.code = "123456";

      const fakeMfAService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: false,
          data: { code: ERROR_CODES.AUTH_APP_INVALID_CODE },
        }),
      } as unknown as VerifyMfaCodeInterface;

      await setupAuthenticatorAppPost(fakeMfAService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeMfAService.verifyMfaCode).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.not.have.been.called;

      expect(res.render).to.have.been.calledWith("setup-authenticator-app/index.njk");
    });

    it("should successfully validate access code and redirect to IPV", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.session.user.isIdentityRequired = true;
      req.body.code = "123456";

      const fakeMfAService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({ success: true }),
      } as unknown as VerifyMfaCodeInterface;

      await setupAuthenticatorAppPost(fakeMfAService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeMfAService.verifyMfaCode).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;

      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should throw error when not a valid error from verify access code", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.body.code = "123456";

      const fakeMfAService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: false,
          data: {
            code: "1234",
            message: "error",
          },
        }),
      } as unknown as VerifyMfaCodeInterface;

      await assert.rejects(
        async () =>
          setupAuthenticatorAppPost(fakeMfAService)(req as Request, res as Response),
        BadRequestError,
        "1234:error"
      );
    });
  });
});
