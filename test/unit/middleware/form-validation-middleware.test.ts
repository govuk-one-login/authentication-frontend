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

    [
      "alternative",
      "alternative_grouped",
      "unknown_fields",
      "unknown_type",
    ].forEach((type) => {
      it(`should throw for unsupported error type '${type}'`, () => {
        const error = { type } as any;

        expect(() => validationErrorFormatter(error)).to.throw(
          `Unsupported express-validator error type: ${type}`
        );
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
