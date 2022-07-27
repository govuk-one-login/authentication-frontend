import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { errorPageGet } from "../error-controller";

import { PATH_NAMES } from "../../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("error page controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.ERROR_PAGE,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("errorPageGet", () => {
    it("should render the error page", () => {
      errorPageGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("common/errors/500.njk");
    });
  });
});
