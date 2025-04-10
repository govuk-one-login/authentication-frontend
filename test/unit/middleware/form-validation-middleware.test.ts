import { expect } from "chai";
import { describe } from "mocha";
import type { Request, Response } from "express";
import { sinon } from "../../utils/test-utils.js";
import {
  validateBodyMiddleware,
  validationErrorFormatter,
} from "../../../src/middleware/form-validation-middleware.js";
import { mockRequest, mockResponse } from "mock-req-res";
import type { SinonStub } from "sinon";

describe("HTML Lang middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: SinonStub;

  beforeEach(() => {
    req = mockRequest({ i18n: { language: "en" } });

    res = mockResponse();
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("validationErrorFormatter", () => {
    it("should format error message", () => {
      const error = {
        location: "body",
        msg: "error message",
        param: "param",
      };

      const formattedError = validationErrorFormatter(error);

      expect(formattedError).to.be.eql({
        text: error.msg,
        href: `#${error.param}`,
      });
    });
  });

  describe("validateBodyMiddleware", () => {
    it("should validate request", () => {
      validateBodyMiddleware("test.html")(
        req as Request,
        res as Response,
        next
      );
      expect(next).to.have.been.called;
    });
  });
});
