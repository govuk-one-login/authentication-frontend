import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import { passkeyCreatedGet } from "../passkey-created-controller.js";
import { PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";

describe("passkey created controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.PASSKEY_CREATED);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("passkeyCreatedGet", () => {
    it("should render passkey created page", () => {
      req.session.client.serviceType = "MANDATORY";
      req.session.client.name = "test client name";

      passkeyCreatedGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("passkey-created/index.njk");
    });
  });
});
