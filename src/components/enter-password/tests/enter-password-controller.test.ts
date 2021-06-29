import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { NextFunction, Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../../services/authentication-service.interface";
import {
  enterPasswordGet,
  enterPasswordPost,
} from "../enter-password-controller";
import { UserSession } from "../../../types";
import { PATH_NAMES, USER_STATE } from "../../../app.constants";

describe("enter password controller", () => {
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
      enterPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-password/index.njk");
    });
  });

  describe("enterPasswordPost", () => {
    it("should redirect to enter-code when the password is correct", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.returns(true),
        signUpUser: sandbox.fake(),
        logInUser: sandbox.fake.returns(USER_STATE.AUTHENTICATED),
      };

      req.session.user.email = "test.test.com";
      req.session.user.id = "test.test.com";
      req.body["password"] = "password";

      await enterPasswordPost(fakeUserAuthService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.LOG_IN_ENTER_PHONE_NUMBER
      );
    });

    it("should throw error when api throws error", async () => {
      const error = new Error("error");
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.throws(error),
        signUpUser: sandbox.fake(),
        logInUser: sandbox.fake.throws(error),
      };

      req.session.user.email = "test.test.com";
      req.session.user.id = "test.test.com";
      req.body["password"] = "password";

      await enterPasswordPost(fakeUserAuthService)(
        req as Request,
        res as Response,
        next
      );

      expect(next).to.have.calledWith(error);
    });
  });
});
