import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  checkYourPhoneGet,
  checkYourPhonePost,
} from "../check-your-phone-controller";

import { VerifyCodeInterface } from "../../common/verify-code/types";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("check your phone controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHECK_YOUR_PHONE,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
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
  });

  describe("checkYourPhonePost", () => {
    it("should redirect to /create-password when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          sessionState: "PHONE_NUMBER_CODE_VERIFIED",
          success: true,
        }),
      };

      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake(),
      };

      req.body.code = "123456";
      res.locals.sessionId = "123456-djjad";

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL
      );
    });

    it("should return error when invalid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.INVALID_VERIFY_PHONE_NUMBER_CODE,
            message: "",
          },
        }),
      };
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake(),
      };

      req.t = sinon.fake.returns("translated string");
      req.body.code = "678988";
      res.locals.sessionId = "123456-djjad";

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith("check-your-phone/index.njk");
    });

    it("should redirect to security code expired when invalid code entered more than max retries", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES,
            message: "",
          },
        }),
      };

      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake(),
      };

      req.t = sinon.fake.returns("translated string");
      req.body.code = "678988";
      res.locals.sessionId = "123456-djjad";

      await checkYourPhonePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith(
        `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=otpMaxRetries`
      );
    });
  });
});
