import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";

import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { passwordResetRequiredGet } from "../password-reset-required-controller";
import { PATH_NAMES } from "../../../../app.constants";

describe("account intervention controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.PASSWORD_RESET_REQUIRED,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
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
