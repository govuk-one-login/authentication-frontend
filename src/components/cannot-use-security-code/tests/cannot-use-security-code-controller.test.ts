import { expect } from "chai";
import { describe } from "mocha";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import {
  mockResponse,
  type RequestOutput,
  type ResponseOutput,
} from "mock-req-res";
import { cannotUseSecurityCodeGet } from "../cannot-use-security-code-controller.js";

describe("cannot use security code controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CANNOT_USE_SECURITY_CODE);
    res = mockResponse();
  });

  describe("cannotUseSecurityCodeGet", () => {
    it("should render the cannot use security code view", () => {
      cannotUseSecurityCodeGet(req, res);

      expect(res.render).to.have.been.calledWith(
        "cannot-use-security-code/index.njk"
      );
    });
  });
});
