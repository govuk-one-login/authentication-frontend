import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { accountCreatedGet } from "../account-created-controller";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("account created controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.ACCOUNT_NOT_FOUND,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("registerAccountCreatedGet", () => {
    it("should render account created page", () => {
      req.session.client.serviceType = "MANDATORY";
      req.session.client.name = "test client name";

      accountCreatedGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("account-created/index.njk");
    });
  });
});
