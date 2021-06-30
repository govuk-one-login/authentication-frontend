import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../../services/authentication-service.interface";
import {
  enterPasswordGet,
  enterPasswordPost,
} from "../enter-password-controller";
import { UserSession } from "../../../types";
import { PATH_NAMES, USER_STATE } from "../../../app.constants";
import { createPasswordPost } from "../../create-password/create-password-controller";

describe("enter password controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
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

      req.session.user = {
        id: "12-d0dasdk",
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await enterPasswordPost(fakeUserAuthService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_PHONE);
    });

    it("should throw error when API call throws error", async () => {
      const error = new Error("Internal server error");
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake(),
        signUpUser: sandbox.fake(),
        logInUser: sandbox.fake.throws(error),
      };

      req.session.user = {
        id: "12-d0dasdk",
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await expect(
        enterPasswordPost(fakeUserAuthService)(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");
      expect(fakeUserAuthService.logInUser).to.have.been.calledOnce;
    });
  });
});
