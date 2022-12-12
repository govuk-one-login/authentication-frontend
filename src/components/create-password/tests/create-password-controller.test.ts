import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  createPasswordPost,
  createPasswordGet,
} from "../create-password-controller";
import { CreatePasswordServiceInterface } from "../types";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("create-password controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createPasswordGet", () => {
    it("should render create password view", () => {
      createPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("create-password/index.njk");
    });
  });

  describe("createPasswordGetABScenario", () => {
    it("should render create password view", () => {

      req.session.user.abTest = true;
      createPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("create-password/index-variant.njk");
    });
  });

  describe("createPasswordPost", () => {
    it("should redirect to get security codes when 2 factor is required", async () => {
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sinon.fake.returns({
          data: {
            consentRequired: false,
          },
          success: true,
        }),
      };

      req.body.password = "password1";
      req.session.user.email = "joe.bloggs@test.com";
      res.locals.sessionId = "34234dsf";

      await createPasswordPost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.GET_SECURITY_CODES);
      expect(fakeService.signUpUser).to.have.been.calledOnce;
    });

    it("should throw error when session is not populated", async () => {
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sinon.fake(),
      };

      req.body.password = "password1";
      req.session.user = undefined;

      await expect(
        createPasswordPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(
        TypeError,
        "Cannot read properties of undefined (reading 'email')"
      );
      expect(fakeService.signUpUser).to.have.not.been.called;
    });

    it("should throw error when password field is not in body", async () => {
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sinon.fake(),
      };

      req.body = undefined;
      req.session.user.email = "joe.bloggs@test.com";

      await expect(
        createPasswordPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(
        TypeError,
        "Cannot read properties of undefined (reading 'password')"
      );
      expect(fakeService.signUpUser).to.have.not.been.called;
    });

    it("should throw error when API call returns error", async () => {
      const error = new Error("Internal server error");
      const fakeService: CreatePasswordServiceInterface = {
        signUpUser: sinon.fake.throws(error),
      };

      req.body.password = "password1";
      req.session.user.email = "joe.bloggs@test.com";

      await expect(
        createPasswordPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");
      expect(fakeService.signUpUser).to.have.been.called;
    });
  });
});
