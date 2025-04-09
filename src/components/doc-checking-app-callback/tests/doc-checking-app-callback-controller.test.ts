import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import { Request, Response } from "express";

import { PATH_NAMES } from "../../../app.constants.js";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { docCheckingAppCallbackGet } from "../doc-checking-app-callback-controller.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("doc checking app callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.DOC_CHECKING_APP_CALLBACK);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("docCheckingAppCallbackGet", () => {
    it("should redirect to auth code", async () => {
      await docCheckingAppCallbackGet(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });
  });
});
