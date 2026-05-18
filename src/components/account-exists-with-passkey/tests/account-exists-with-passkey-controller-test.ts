import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { getAccountExistsWithPasskey } from "../account-exists-with-passkey-controller.js";

describe("account exists with passkey", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("passwordResetRequiredGet", () => {
    it("should render the account exists with passkey view", () => {
      getAccountExistsWithPasskey(req, res);

      expect(res.render).to.have.calledWith(
        "account-exists-with-passkey/index.njk"
      );
    });
  });
});
