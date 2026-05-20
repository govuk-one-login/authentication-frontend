import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import {
  accountExistsWithPasskeyGet,
  accountExistsWithPasskeyPost,
} from "../account-exists-with-passkey-controller.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";

describe("account exists with passkey", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const { email } = commonVariables;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY);
    res = mockResponse();
    req.session.user = { email };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("accountExistsWithPasskeyGet", () => {
    it("should render the account exists with passkey view", () => {
      accountExistsWithPasskeyGet(req, res);

      expect(res.render).to.have.calledWith(
        "account-exists-with-passkey/index.njk",
        { email }
      );
    });
  });

  describe("accountExistsWithPasskeyPost", () => {
    it("should redirect to sign in with passkey", async () => {
      req.session.user.journey = {
        nextPath: PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY,
        optionalPaths: [],
      };

      await accountExistsWithPasskeyPost()(req, res);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_WITH_PASSKEY);
    });
  });
});
