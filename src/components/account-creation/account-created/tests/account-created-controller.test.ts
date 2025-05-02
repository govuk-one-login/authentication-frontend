import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import type { Request, Response } from "express";

import {
  accountCreatedGet,
  accountCreatedPost,
} from "../account-created-controller";
import { PATH_NAMES } from "../../../../app.constants";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";
describe("account created controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("accountCreatedGet", () => {
    it("should render account created page", () => {
      req.session.client.serviceType = "MANDATORY";
      req.session.client.name = "test client name";

      accountCreatedGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("account-created/index.njk");
    });

    it("should pass through the strategicAppChannel", () => {
      req.session.client.serviceType = "MANDATORY";
      req.session.client.name = "test client name";
      res.locals.strategicAppChannel = true;

      accountCreatedGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("account-created/index.njk", {
        serviceType: "MANDATORY",
        name: "test client name",
        strategicAppChannel: true,
      });
    });
  });
  describe("accountCreatedPost", () => {
    it("should redirect to auth code", async () => {
      await accountCreatedPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });
  });
});
