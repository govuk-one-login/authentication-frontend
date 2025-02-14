import { expect } from "chai";
import { describe } from "mocha";
import { Request, Response } from "express";
import { sinon } from "../../utils/test-utils";
import {
  validateBodyMiddleware,
  validationErrorFormatter,
} from "../../../src/middleware/form-validation-middleware";
import { mockRequest, mockResponse } from "mock-req-res";
import { SinonStub } from "sinon";
import { FieldValidationError } from "express-validator";

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
      const error: FieldValidationError = {
        type: "field",
        location: "body",
        msg: "error message",
        path: "param",
      };

      const formattedError = validationErrorFormatter(error);

      expect(formattedError).to.be.eql({
        text: error.msg,
        href: `#${error.path}`,
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
