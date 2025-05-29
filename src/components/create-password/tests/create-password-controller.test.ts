import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import { createPasswordPost, createPasswordGet } from "../create-password-controller.js";
import type { CreatePasswordServiceInterface } from "../types.js";
import { PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { strict as assert } from "assert";

describe("create-password controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
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

    describe("createPasswordPost", () => {
      it("should redirect to get security codes when 2 factor is required", async () => {
        const fakeService: CreatePasswordServiceInterface = {
          signUpUser: sinon.fake.returns({
            success: true,
          }),
        } as unknown as CreatePasswordServiceInterface;

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

        await assert.rejects(
          async () => createPasswordPost(fakeService)(req as Request, res as Response),
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

        await assert.rejects(
          async () => createPasswordPost(fakeService)(req as Request, res as Response),
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

        await assert.rejects(
          async () => createPasswordPost(fakeService)(req as Request, res as Response),
          Error,
          "Internal server error"
        );
        expect(fakeService.signUpUser).to.have.been.called;
      });
    });
  });
});
