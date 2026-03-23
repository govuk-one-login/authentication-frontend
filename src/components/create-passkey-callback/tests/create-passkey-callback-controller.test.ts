import { describe } from "mocha";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import { expect } from "chai";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createPasskeyCallbackGet } from "../create-passkey-callback-controller.js";

describe("create-passkey-callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CREATE_PASSKEY_CALLBACK);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createPasskeyCallbackGet", () => {
    it("should return dummy page", () => {
      createPasskeyCallbackGet(req as Request, res as Response);
      expect(res.sendStatus).to.have.been.calledWith(200);
    });
  });
});
