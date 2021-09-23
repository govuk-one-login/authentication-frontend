import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { UserSession } from "../../../types";
import {
  enterPhoneNumberGet,
  enterPhoneNumberPost,
} from "../enter-phone-number-controller";
import { EnterPhoneNumberServiceInterface } from "../types";

describe("enter phone number controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
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
      const fakeService: EnterPhoneNumberServiceInterface = {
        sendPhoneVerificationNotification: sandbox.fake.returns({
          success: true,
        }),
        updateProfile: sandbox.fake.returns(true),
      };

      res.locals.sessionId = "123456-djjad";
      req.body.phoneNumber = "07738393990";
      req.session.user = {
        email: "test@test.com",
      };

      await enterPhoneNumberPost(fakeService)(req as Request, res as Response);

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(fakeService.sendPhoneVerificationNotification).to.have.been
        .calledOnce;
      expect(res.redirect).to.have.calledWith("/check-your-phone");
      expect(req.session.user.phoneNumber).to.be.eq("*******3990");
    });

    it("should throw error when API call to /update-profile throws error", async () => {
      const error = new Error("Internal server error");
      const fakeService: EnterPhoneNumberServiceInterface = {
        sendPhoneVerificationNotification: sandbox.fake(),
        updateProfile: sandbox.fake.throws(error),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "123456-djjad";

      await expect(
        enterPhoneNumberPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(fakeService.sendPhoneVerificationNotification).to.have.not.been
        .called;
    });

    it("should throw error when API call to /send-notification throws error", async () => {
      const error = new Error("Internal server error");
      const fakeService: EnterPhoneNumberServiceInterface = {
        sendPhoneVerificationNotification: sandbox.fake.throws(error),
        updateProfile: sandbox.fake.returns(true),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "123456-djjad";

      await expect(
        enterPhoneNumberPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(fakeService.sendPhoneVerificationNotification).to.have.been
        .calledOnce;
    });

    it("should throw error when session is not populated", async () => {
      const fakeService: EnterPhoneNumberServiceInterface = {
        sendPhoneVerificationNotification: sandbox.fake(),
        updateProfile: sandbox.fake(),
      };

      req.body.phoneNumber = "07738393990";
      req.session = undefined;

      await expect(
        enterPhoneNumberPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(
        TypeError,
        "Cannot read property 'user' of undefined"
      );

      expect(fakeService.updateProfile).to.have.not.been.called;
      expect(fakeService.sendPhoneVerificationNotification).to.have.not.been
        .called;
    });
  });
});
