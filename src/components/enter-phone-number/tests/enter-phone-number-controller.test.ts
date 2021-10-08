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

describe("enter phone number controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: {} };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("enterPhoneNumberGet", () => {
    it("should render enter phone number view", () => {
      enterPhoneNumberGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-phone-number/index.njk");
    });
  });

  describe("enterPhoneNumberPost", () => {
    it("should redirect to /check-your-phone when success", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sandbox.fake.returns({
          success: true,
          sessionState: "VERIFY_PHONE_NUMBER_CODE_SENT",
        }),
      };

      const fakeProfileService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake.returns({
          success: true,
          sessionState: "ADDED_UNVERIFIED_PHONE_NUMBER",
        }),
      };

      res.locals.sessionId = "123456-djjad";
      req.body.phoneNumber = "07738393990";
      req.session.email = "test@test.com";

      await enterPhoneNumberPost(fakeNotificationService, fakeProfileService)(
        req as Request,
        res as Response
      );

      expect(fakeProfileService.updateProfile).to.have.been.calledOnce;
      expect(fakeNotificationService.sendNotification).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/check-your-phone");
      expect(req.session.phoneNumber).to.be.eq("*******3990");
    });

    it("should throw error when API call to /update-profile throws error", async () => {
      const error = new Error("Internal server error");
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sandbox.fake.returns({
          success: true,
        }),
      };

      const fakeProfileService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake.throws(error),
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
        sendNotification: sandbox.fake.throws(error),
      };

      const fakeProfileService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake.returns({ success: true }),
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

    // it("should throw error when session is not populated", async () => {
    //   const fakeNotificationService: SendNotificationServiceInterface = {
    //     sendNotification: sandbox.fake(),
    //   };
    //
    //   const fakeProfileService: UpdateProfileServiceInterface = {
    //     updateProfile: sandbox.fake(),
    //   };
    //
    //   req.body.phoneNumber = "07738393990";
    //   req.session = null;
    //
    //   await expect(
    //     enterPhoneNumberPost(fakeNotificationService, fakeProfileService)(
    //       req as Request,
    //       res as Response
    //     )
    //   ).to.be.rejectedWith(
    //     TypeError,
    //     "Cannot destructure property 'email' of 'req.session' as it is null"
    //   );
    //
    //   expect(fakeProfileService.updateProfile).to.have.not.been.called;
    //   expect(fakeNotificationService.sendNotification).to.have.not.been.called;
    // });

    it("should update the user session state value in the req", async () => {
      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sandbox.fake.returns({
          success: true,
          sessionState: "VERIFY_PHONE_NUMBER_CODE_SENT",
        }),
      };

      const fakeProfileService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake.returns({
          success: true,
          sessionState: "ADDED_UNVERIFIED_PHONE_NUMBER",
        }),
      };

      res.locals.sessionId = "123456-djjad";
      req.body.phoneNumber = "07738393990";
      req.session = {
        email: "test@test.com",
      };

      expect(req.session.backState).to.be.undefined;

      await enterPhoneNumberPost(fakeNotificationService, fakeProfileService)(
        req as Request,
        res as Response
      );

      expect(req.session.backState).to.equal("VERIFY_PHONE_NUMBER_CODE_SENT");
    });
  });
});
