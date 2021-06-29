import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { NextFunction, Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../../services/authentication-service.interface";
import {
  createPasswordPost,
  createPasswordGet,
} from "../register-create-password-controller";
import { UserSession } from "../../../types";
import { USER_STATE } from "../../../app.constants";

describe("register-create-password controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
    next = sinon.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createPasswordGet", () => {
    it("should render create password view", () => {
      createPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "register-create-password/index.njk"
      );
    });
  });

  describe("createPasswordPost", () => {
    it("should redirect to enter-phone-number when 2 factor is required", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake(),
        signUpUser: sandbox.fake.returns(USER_STATE.REQUIRES_TWO_FACTOR),
        logInUser: sandbox.fake(),
      };

      req.body.password = "password1";
      req.session.user.email = "joe.bloggs@test.com";
      req.session.user.id = "test.test.com";

      await createPasswordPost(fakeUserAuthService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).to.have.calledWith("/enter-phone-number");
    });

    it("should redirect to account-created when 2 factor is not required", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake(),
        signUpUser: sandbox.fake.returns(""),
        logInUser: sandbox.fake(),
      };

      req.body.password = "password1";
      req.session.user.email = "joe.bloggs@test.com";
      req.session.user.id = "test.test.com";

      await createPasswordPost(fakeUserAuthService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).to.have.calledWith("/account-created");
    });

    it("should throw error when session is not populated", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake(),
        signUpUser: sandbox.fake.returns(""),
        logInUser: sandbox.fake(),
      };

      req.body.password = "password1";
      req.session = undefined;

      await expect(
        createPasswordPost(fakeUserAuthService)(
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

    it("should throw error when api returns error", async () => {
      const error = new Error("error");
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake(),
        signUpUser: sandbox.fake.throws(error),
        logInUser: sandbox.fake(),
      };

      req.body.password = "password1";
      req.session.user.email = "joe.bloggs@test.com";
      req.session.user.id = "test.test.com";

      await createPasswordPost(fakeUserAuthService)(
        req as Request,
        res as Response,
        next
      );

      expect(next).to.have.calledWith(error);
    });
  });
});
