import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import {
  accountDeletedGet,
  accountDeletedPost,
} from "../account-deleted-controller.js";
import { PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";

describe("account deleted controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ACCOUNT_DELETED);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("accountDeletedGet", () => {
    it("should render the account deleted page", () => {
      accountDeletedGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("account-deleted/index.njk");
    });
  });

  describe("accountDeletedPost", () => {
    it("should redirect to orchestration with the SFAD error", () => {
      req.session.client.redirectUri = "https://orchestration.test/callback";

      accountDeletedPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        "https://orchestration.test/callback?error=SFAD_ERROR"
      );
    });
  });
});
