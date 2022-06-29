import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  enterPhoneNumberGet,
  enterPhoneNumberPost,
} from "../enter-phone-number-controller";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { UpdateProfileServiceInterface } from "../../common/update-profile/types";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("enter phone number controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("enterPhoneNumberGet", () => {
    it("should render enter phone number view", () => {
      enterPhoneNumberGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-phone-number/index.njk", {
        supportInternationalNumbers: true,
        isAccountPartCreated: undefined,
      });
    });

    it("should render enter phone number returning user view when user has a partly created account", () => {
      req.session.user = {
        isAccountPartCreated: true,
      };
      enterPhoneNumberGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-phone-number/index.njk", {
        supportInternationalNumbers: true,
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
      };

      const fakeProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: true,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      req.body.phoneNumber = "07738393990";
      req.session.user.email = "test@test.com";

      await enterPhoneNumberPost(fakeNotificationService, fakeProfileService)(
        req as Request,
        res as Response
      );

      expect(fakeProfileService.updateProfile).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_PHONE);
      expect(req.session.user.phoneNumber).to.be.eq("*******3990");
    });

    it("should redirect to /check-your-phone when success with valid international number", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      };

      const fakeProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: true,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      req.body.phoneNumber = "+33645453322";
      req.session.user.email = "test@test.com";

      await enterPhoneNumberPost(fakeNotificationService, fakeProfileService)(
        req as Request,
        res as Response
      );

      expect(fakeProfileService.updateProfile).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_PHONE);
      expect(req.session.user.phoneNumber).to.be.eq("********3322");
    });

    it("should throw error when API call to /update-profile throws error", async () => {
      const error = new Error("Internal server error");
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      };

      const fakeProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.throws(error),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "123456-djjad";

      await expect(
        enterPhoneNumberPost(fakeNotificationService, fakeProfileService)(
          req as Request,
          res as Response
        )
      ).to.be.rejectedWith(Error, "Internal server error");

      expect(fakeProfileService.updateProfile).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.not.been.called;
    });

    it("should throw error when API call to /send-notification throws error", async () => {
      const error = new Error("Internal server error");
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.throws(error),
      };

      const fakeProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({ success: true }),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "123456-djjad";

      await expect(
        enterPhoneNumberPost(fakeNotificationService, fakeProfileService)(
          req as Request,
          res as Response
        )
      ).to.be.rejectedWith(Error, "Internal server error");

      expect(fakeProfileService.updateProfile).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
    });
  });
});
