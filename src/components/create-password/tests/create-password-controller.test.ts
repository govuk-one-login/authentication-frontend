import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  createPasswordPost,
  createPasswordGet,
} from "../create-password-controller";
import { UserSession } from "../../../types";
import { USER_STATE } from "../../../app.constants";
import { CreatePasswordServiceInterface } from "../types";

describe("create-password controller", () => {
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

  describe("createPasswordGet", () => {
    it("should render create password view", () => {
      createPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("create-password/index.njk");
    });
  });

  describe("createPasswordPost", () => {
    it("should redirect to enter-phone-number when 2 factor is required", async () => {
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sandbox.fake.returns(USER_STATE.REQUIRES_TWO_FACTOR),
      };

      req.body.password = "password1";
      req.session.user = {
        id: "12-d0dasdk4d",
        email: "joe.bloggs@test.com",
      };

      await createPasswordPost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/enter-phone-number");
      expect(fakeService.signUpUser).to.have.been.calledOnce;
    });

    it("should redirect to account-created when 2 factor is not required", async () => {
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sandbox.fake.returns(""),
      };

      req.body.password = "password1";
      req.session.user = {
        id: "12-d0dasdk",
        email: "joe.bloggs@test.com",
      };

      await createPasswordPost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/account-created");
      expect(fakeService.signUpUser).to.have.been.calledOnce;
    });

    it("should throw error when session is not populated", async () => {
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sandbox.fake(),
      };

      req.body.password = "password1";
      req.session = undefined;

      await expect(
        createPasswordPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(
        TypeError,
        "Cannot read property 'user' of undefined"
      );
      expect(fakeService.signUpUser).to.have.not.been.called;
    });

    it("should throw error when password field is not in body", async () => {
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sandbox.fake(),
      };

      req.body = undefined;
      req.session.user = {
        id: "12-d0dasdk",
        email: "joe.bloggs@test.com",
      };

      await expect(
        createPasswordPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(
        TypeError,
        "Cannot read property 'password' of undefined"
      );
      expect(fakeService.signUpUser).to.have.not.been.called;
    });

    it("should throw error when API call returns error", async () => {
      const error = new Error("Internal server error");
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sandbox.fake.throws(error),
      };

      req.body.password = "password1";
      req.session.user = {
        id: "12-d0dasdk3d",
        email: "joe.bloggs@test.com",
      };

      await expect(
        createPasswordPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");
      expect(fakeService.signUpUser).to.have.been.called;
    });
  });
});
