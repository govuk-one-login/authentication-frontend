import { expect } from "chai";
import { describe } from "mocha";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { mockResponse, type RequestOutput, type ResponseOutput } from "mock-req-res";
import { cannotUseEmailAddressGet } from "../cannot-use-email-address-controller.js";

describe("cannot use email address controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS);
    res = mockResponse();
  });

  describe("cannotUseEmailAddressGet", () => {
    it("should render the cannot use email address view", () => {
      cannotUseEmailAddressGet(req, res);

      expect(res.render).to.have.been.calledWith("cannot-use-email-address/index.njk");
    })
  })
})