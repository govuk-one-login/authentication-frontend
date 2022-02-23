import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  enterEmailCreateGet,
  enterEmailCreatePost,
  enterEmailGet,
  enterEmailPost,
} from "../enter-email-controller";
import { EnterEmailServiceInterface } from "../types";
import { JOURNEY_TYPE } from "../../common/constants";
import { PATH_NAMES } from "../../../app.constants";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("enter email controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("enterEmailGet", () => {
    it("should render enter email create account view when user selected create account", () => {
      req.query.type = JOURNEY_TYPE.CREATE_ACCOUNT;

      enterEmailCreateGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-email/index-create-account.njk"
      );
    });
  });

  describe("enterEmailGet", () => {
    it("should render enter email create account view when user selected sign in", () => {
      enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-email/index-existing-account.njk"
      );
    });
  });

  describe("enterEmailPost", () => {
    it("should redirect to /enter-password when account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { doesUserExist: true },
        }),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "dsad.dds";
      req.path = PATH_NAMES.ENTER_EMAIL_SIGN_IN;

      await enterEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.userExists).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });

    it("should redirect to /account-not-found when no account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { doesUserExist: false },
        }),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "sadl990asdald";
      req.path = PATH_NAMES.ENTER_EMAIL_SIGN_IN;

      await enterEmailPost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ACCOUNT_NOT_FOUND);
      expect(fakeService.userExists).to.have.been.calledOnce;
    });

    it("should throw error when API call throws error", async () => {
      const error = new Error("Internal server error");
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.throws(error),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "231dccsd";

      await expect(
        enterEmailPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");
      expect(fakeService.userExists).to.have.been.calledOnce;
    });

    it("should throw error when session is not populated", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake(),
      };

      req.body.email = "test.test.com";
      req.session.user = undefined;

      await expect(
        enterEmailPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(
        TypeError,
        "Cannot set properties of undefined (setting 'email')"
      );

      expect(fakeService.userExists).not.to.been.called;
    });
  });

  describe("enterEmailCreatePost", () => {
    it("should redirect to /enter-password when account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { doesUserExist: true },
        }),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "dsad.dds";
      req.path = PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT;

      await enterEmailCreatePost(fakeService)(req as Request, res as Response);

      expect(fakeService.userExists).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS
      );
    });

    it("should redirect to /check-your-email when no account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { userExists: false },
        }),
      };

      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "sadl990asdald";
      req.path = PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT;

      await enterEmailCreatePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_EMAIL);
      expect(fakeService.userExists).to.have.been.calledOnce;
    });
  });
});
