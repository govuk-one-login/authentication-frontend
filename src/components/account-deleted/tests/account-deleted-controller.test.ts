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
    const expectedRedirect =
      "https://orchestration.test/callback?error=account_creation_required";

    beforeEach(() => {
      req.session.client.redirectUri = "https://orchestration.test/callback";
      req.session.destroy = sinon.stub().callsArg(0);
    });

    it("should redirect to orchestration with the account creation required error", () => {
      accountDeletedPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(expectedRedirect);
    });

    it("should clear the aps cookie and destroy the session before redirecting", () => {
      accountDeletedPost(req as Request, res as Response);

      expect(res.clearCookie).to.have.been.calledOnceWith("aps");
      expect(req.session.destroy).to.have.been.calledOnce;
      expect(res.clearCookie).to.have.been.calledBefore(res.redirect);
      expect(req.session.destroy).to.have.been.calledBefore(res.redirect);
    });

    it("should not redirect until the session has been destroyed", () => {
      req.session.destroy = sinon.stub();

      accountDeletedPost(req as Request, res as Response);

      expect(res.redirect).to.not.have.been.called;

      req.session.destroy.callArg(0);

      expect(res.redirect).to.have.been.calledWith(expectedRedirect);
    });

    it("should log and still redirect when the session cannot be destroyed", () => {
      req.session.destroy = sinon.stub().callsArgWith(0, new Error("boom"));

      accountDeletedPost(req as Request, res as Response);

      expect(req.log.error).to.have.been.calledWith(
        "Failed to delete session: Error: boom"
      );
      expect(res.redirect).to.have.been.calledWith(expectedRedirect);
    });
  });
});
