import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { passwordResetRequiredGet } from "../password-reset-required-controller.js";
import { PATH_NAMES } from "../../../../app.constants.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
describe("password reset required controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.PASSWORD_RESET_REQUIRED);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("passwordResetRequiredGet", () => {
    it("should render the password reset required view", () => {
      passwordResetRequiredGet(req, res);

      expect(res.render).to.have.calledWith(
        "account-intervention/password-reset-required/index.njk"
      );
    });
  });
});
