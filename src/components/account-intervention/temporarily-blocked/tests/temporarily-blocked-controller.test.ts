import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";

import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { temporarilyBlockedGet } from "../temporarily-blocked-controller";
import { PATH_NAMES } from "../../../../app.constants";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";

describe("temporarily blocked controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.UNAVAILABLE_TEMPORARY);
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
