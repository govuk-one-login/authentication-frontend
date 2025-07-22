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
import type { FieldValidationError } from "express-validator";

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
    it("should format field error message", () => {
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

    it("should format alternative error message", () => {
      const error = {
        type: "alternative",
        msg: "alternative error",
      } as any;

      const formattedError = validationErrorFormatter(error);

      expect(formattedError).to.equal("alternative error");
    });

    it("should format alternative_grouped error message", () => {
      const error = {
        type: "alternative_grouped",
        msg: "grouped error",
      } as any;

      const formattedError = validationErrorFormatter(error);

      expect(formattedError).to.equal("grouped error");
    });

    it("should format unknown_fields error message", () => {
      const error = {
        type: "unknown_fields",
        fields: [{ path: "field1" }, { path: "field2" }],
      } as any;

      const formattedError = validationErrorFormatter(error);

      expect(formattedError).to.equal(
        "Unknown fields found, please remove them: field1, field2"
      );
    });

    it("should throw error for unknown error type", () => {
      const error = {
        type: "unknown_type",
        msg: "unknown error",
      } as any;

      expect(() => validationErrorFormatter(error)).to.throw(
        "Not a known express-validator error"
      );
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
