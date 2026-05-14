import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import { signInWithPasskeyGet } from "../sign-in-with-passkey-controller.js";
import { PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";

describe("sign in with passkey controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.SIGN_IN_WITH_PASSKEY);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("signInWithPasskeyGet", () => {
    it("should render the sign in with passkey view", async () => {
      signInWithPasskeyGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("sign-in-with-passkey/index.njk");
    });
  });
});
