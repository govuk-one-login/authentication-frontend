import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { NextFunction, Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../../services/authentication-service.interface";
import { enterEmailGet, enterEmailPost } from "../enter-email-controller";
import { UserSession } from "../../../types";
import { NotificationServiceInterface } from "../../../services/notification-service.interface";

describe("enter email controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
    next = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("enterEmailGet", () => {
    it("should render enter email view", () => {
      enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-email/index.njk");
    });
  });

  describe("enterEmailPost", () => {
    it("should redirect to enter-password when account exists", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.returns(true),
        signUpUser: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      req.session.user.id = "test.test.com";

      await enterEmailPost(fakeUserAuthService, null)(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).to.have.calledWith("/enter-password");
    });

    it("should redirect to /verify-email when no account exists", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.returns(false),
        signUpUser: sandbox.fake(),
      };

      const fakeNotificationService: NotificationServiceInterface = {
        sendNotification: sandbox.fake(),
        verifyCode: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      req.session.user.id = "test.test.com";

      await enterEmailPost(fakeUserAuthService, fakeNotificationService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).to.have.calledWith("/check-your-email");
      expect(fakeNotificationService.sendNotification).to.have.calledOnce;
      expect(fakeUserAuthService.userExists).to.have.calledOnce;
    });

    it("should throw error when api throws error", async () => {
      const error = new Error("error");
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.throws(error),
        signUpUser: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      req.session.user.id = "test.test.com";

      await enterEmailPost(fakeUserAuthService, null)(
        req as Request,
        res as Response,
        next
      );

      expect(next).to.have.calledWith(error);
    });

    it("should throw error when session is not populated", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.returns(""),
        signUpUser: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      req.session = undefined;

      await expect(
        enterEmailPost(fakeUserAuthService, null)(
          req as Request,
          res as Response,
          next
        )
      );

      expect(next).to.have.been.calledOnce;
      expect(next).to.have.been.calledWithMatch(
        sinon.match.instanceOf(TypeError)
      );
      expect(next).to.have.been.calledWithMatch(
        sinon.match.has("message", "Cannot read property 'user' of undefined")
      );
    });
  });
});
