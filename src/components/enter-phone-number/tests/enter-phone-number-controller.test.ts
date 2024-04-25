import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  enterPhoneNumberGet,
  enterPhoneNumberPost,
} from "../enter-phone-number-controller";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { PATH_NAMES } from "../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { ERROR_CODES } from "../../common/constants";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

const OLD_ENV = process.env;

describe("enter phone number controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER);
    res = mockResponse();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    sinon.restore();
    process.env = OLD_ENV;
  });

  describe("enterPhoneNumberGet", () => {
    it("should render enter phone number view", () => {
      enterPhoneNumberGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-phone-number/index.njk", {
        isAccountPartCreated: undefined,
      });
    });

    it("should render enter phone number returning user view when user has a partly created account", () => {
      req.session.user = {
        isAccountPartCreated: true,
      };
      enterPhoneNumberGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-phone-number/index.njk", {
        isAccountPartCreated: true,
      });
    });
  });

  describe("enterPhoneNumberPost", () => {
    it("should redirect to /check-your-phone when success with valid UK number", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SendNotificationServiceInterface;

      res.locals.sessionId = "123456-djjad";
      req.body.phoneNumber = "07738393990";
      req.session.user.email = "test@test.com";

      await enterPhoneNumberPost(fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_PHONE);
      expect(req.session.user.redactedPhoneNumber).to.be.eq("3990");
    });

    it("should redirect to /check-your-phone when success with valid international number", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SendNotificationServiceInterface;

      res.locals.sessionId = "123456-djjad";
      req.body.phoneNumber = "+33645453322";
      req.session.user.email = "test@test.com";

      await enterPhoneNumberPost(fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_PHONE);
      expect(req.session.user.redactedPhoneNumber).to.be.eq("3322");
    });

    it("should throw error when API call to /send-notification throws error", async () => {
      const error = new Error("Internal server error");
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.throws(error),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "123456-djjad";

      await expect(
        enterPhoneNumberPost(fakeNotificationService)(
          req as Request,
          res as Response
        )
      ).to.be.rejectedWith(Error, "Internal server error");

      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
    });

    it("should render security-code-error/index-wait.njk when user is locked and tries to complete the journey again ", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.VERIFY_PHONE_NUMBER_MAX_CODES_SENT,
          },
        }),
      } as unknown as SendNotificationServiceInterface;

      res.locals.sessionId = "123456-djjad";
      req.body.phoneNumber = "+33645453322";
      req.session.user.email = "test@test.com";

      await enterPhoneNumberPost(fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });

    it(
      "should render security-code-error/index-wait.njk and isAccountCreationJourney as true pass page " +
        "when user is locked and tries to complete the journey again for account part created journey",
      async () => {
        const fakeNotificationService: SendNotificationServiceInterface = {
          sendNotification: sinon.fake.returns({
            success: false,
            data: {
              code: ERROR_CODES.VERIFY_PHONE_NUMBER_MAX_CODES_SENT,
            },
          }),
        } as unknown as SendNotificationServiceInterface;
        process.env.SUPPORT_2HR_LOCKOUT = "1";
        res.locals.sessionId = "123456-djjad";
        req.body.phoneNumber = "+33645453322";
        req.session.user.email = "test@test.com";
        req.session.user.isAccountPartCreated = true;

        await enterPhoneNumberPost(fakeNotificationService)(
          req as Request,
          res as Response
        );

        expect(fakeNotificationService.sendNotification).to.have.been
          .calledOnce;
        expect(res.render).to.have.calledWith(
          "security-code-error/index-wait.njk",
          {
            newCodeLink: undefined,
            support2hrLockout: true,
            isAccountCreationJourney: true,
          }
        );
      }
    );

    it(
      "should render security-code-error/index-wait.njk and isAccountCreationJourney as true pass page " +
        "when user is locked and tries to complete the journey again for account creation journey",
      async () => {
        const fakeNotificationService: SendNotificationServiceInterface = {
          sendNotification: sinon.fake.returns({
            success: false,
            data: {
              code: ERROR_CODES.VERIFY_PHONE_NUMBER_MAX_CODES_SENT,
            },
          }),
        } as unknown as SendNotificationServiceInterface;
        process.env.SUPPORT_2HR_LOCKOUT = "1";
        res.locals.sessionId = "123456-djjad";
        req.body.phoneNumber = "+33645453322";
        req.session.user.email = "test@test.com";
        req.session.user.isAccountCreationJourney = true;

        await enterPhoneNumberPost(fakeNotificationService)(
          req as Request,
          res as Response
        );

        expect(fakeNotificationService.sendNotification).to.have.been
          .calledOnce;
        expect(res.render).to.have.calledWith(
          "security-code-error/index-wait.njk",
          {
            newCodeLink: undefined,
            support2hrLockout: true,
            isAccountCreationJourney: true,
          }
        );
      }
    );
  });
});
