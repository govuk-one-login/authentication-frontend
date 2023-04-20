import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { cannotChangeSecurityCodesGet } from "../cannot-change-security-codes-controller";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("cannot change security codes controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("cannotChangeSecurityCodesGet", () => {
    it("should render the cannot change security codes page", () => {
      cannotChangeSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith(
        "cannot-change-security-codes/index.njk"
      );
    });
  });
});
