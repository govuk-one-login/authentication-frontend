import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";

import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { temporarilyBlockedGet } from "../temporarily-blocked-controller";
import { PATH_NAMES } from "../../../../app.constants";

describe("temporarily blocked controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.UNAVAILABLE_TEMPORARY,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("temporarilyBlockedGet", () => {
    it("should render the temporarily blocked view", () => {
      temporarilyBlockedGet(req, res);

      expect(res.render).to.have.calledWith(
        "account-intervention/temporarily-blocked/index.njk"
      );
    });
  });
});
