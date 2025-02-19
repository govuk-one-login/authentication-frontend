import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  checkYourPhoneGet,
  checkYourPhonePost,
} from "../check-your-phone-controller";

import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { VerifyMfaCodeInterface } from "../../enter-authenticator-app-code/types";
import * as journey from "../../common/journey/journey";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { commonVariables } from "../../../../test/helpers/common-test-variables";
import { getPermittedJourneyForPath } from "../../../utils/session";

describe("check your phone controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_PHONE);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("checkYourPhoneGet", () => {
    it("should render check your phone view", () => {
      checkYourPhoneGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("check-your-phone/index.njk");
    });

    it("should render security-code-error/index-wait.njk if user has been locked out in current session", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      req.session.user.codeRequestLock = tomorrow.toUTCString();
      checkYourPhoneGet(req as Request, res as Response);
      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });
  });

  describe("checkYourPhonePost", () => {
    let fakeNotificationService: SendNotificationServiceInterface;

    beforeEach(() => {
      fakeNotificationService = { sendNotification: sinon.fake() };
      res.locals.sessionId = commonVariables.sessionId;
      req.body.code = "123456";
    });

    it("can send the journeyType when requesting the MFA code", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          sessionState: "PHONE_NUMBER_CODE_VERIFIED",
          success: true,
        }),
      } as unknown as VerifyMfaCodeInterface;

      const getJourneyTypeFromUserSessionSpy = sinon.spy(
        journey,
        "getJourneyTypeFromUserSession"
      );

      req.session.user.isAccountRecoveryPermitted = true;
      req.session.user.isAccountRecoveryJourney = true;

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(
        getJourneyTypeFromUserSessionSpy
      ).to.have.been.calledOnceWithExactly(req.session.user, {
        includeAccountRecovery: true,
        fallbackJourneyType: JOURNEY_TYPE.REGISTRATION,
      });
      expect(getJourneyTypeFromUserSessionSpy.getCall(0).returnValue).to.equal(
        JOURNEY_TYPE.ACCOUNT_RECOVERY
      );
      expect(fakeService.verifyMfaCode).to.have.been.calledOnceWithExactly(
        sinon.match.any,
        sinon.match.any,
        commonVariables.sessionId,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        JOURNEY_TYPE.ACCOUNT_RECOVERY,
        sinon.match.any
      );
    });

    it("should redirect to //account-confirmation when valid code entered", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          sessionState: "PHONE_NUMBER_CODE_VERIFIED",
          success: true,
        }),
      } as unknown as VerifyMfaCodeInterface;

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.calledWith(
        commonVariables.sessionId,
        undefined,
        undefined,
        NOTIFICATION_TYPE.ACCOUNT_CREATED_CONFIRMATION,
        undefined,
        "",
        req
      );
      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL
      );
    });

    it("should redirect to /change-codes-confirmed when valid code entered for account recovery journey ", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          sessionState: "PHONE_NUMBER_CODE_VERIFIED",
          success: true,
        }),
      } as unknown as VerifyMfaCodeInterface;

      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.CHECK_YOUR_PHONE),
        isAccountRecoveryPermitted: true,
        isAccountRecoveryJourney: true,
      };

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.calledWith(
        commonVariables.sessionId,
        undefined,
        undefined,
        NOTIFICATION_TYPE.CHANGE_HOW_GET_SECURITY_CODES_CONFIRMATION,
        undefined,
        "",
        req
      );
      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION
      );
    });

    it("should return error when invalid code entered", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.INVALID_VERIFY_PHONE_NUMBER_CODE,
            message: "",
          },
        }),
      } as unknown as VerifyMfaCodeInterface;

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith("check-your-phone/index.njk");
    });

    it("should redirect to security code expired when invalid code entered more than max retries", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES,
            message: "",
          },
        }),
      } as unknown as VerifyMfaCodeInterface;

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyMfaCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith(
        `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=otpMaxRetries`
      );
    });
  });
});
