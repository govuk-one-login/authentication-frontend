import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import { sessionEndedGet } from "../session-ended-controller.js";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";

describe("session ended controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.SESSION_ENDED);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("sessionEndedGet", () => {
    it("should render the session ended page", () => {
      sessionEndedGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("session-ended/index.njk");
    });

    it("should return a 401 status code", () => {
      sessionEndedGet(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    });
  });
});
