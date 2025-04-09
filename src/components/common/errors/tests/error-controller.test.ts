import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import { errorPageGet } from "../error-controller.js";
import { PATH_NAMES } from "../../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
describe("error page controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ERROR_PAGE);
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
