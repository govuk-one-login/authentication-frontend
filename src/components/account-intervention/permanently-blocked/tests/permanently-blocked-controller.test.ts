import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";

import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { permanentlyBlockedGet } from "../permanently-blocked-controller";
import { PATH_NAMES } from "../../../../app.constants";

describe("permanently blocked controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.UNAVAILABLE_PERMANENT,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("blockedGet", () => {
    it("should render the account blocked view", () => {
      permanentlyBlockedGet(req, res);

      expect(res.render).to.have.calledWith(
        "account-intervention/permanently-blocked/index.njk"
      );
    });
  });
});
