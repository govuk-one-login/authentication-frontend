import { expect } from "chai";
import { describe } from "mocha";
import { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils";
import { setInternationalPhoneNumberSupportMiddleware } from "../../../src/middleware/set-international-phone-number-support-middleware";
import { mockRequest, mockResponse } from "mock-req-res";

describe("Set international phone number support middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("setInternationalPhoneNumberSupportMiddleware", () => {
    it("should add ipnSupport to response locals", () => {
      setInternationalPhoneNumberSupportMiddleware(
        req as Request,
        res as Response,
        next
      );
      expect(res.locals).to.have.property("ipnSupport");
    });

    it("should call next function", () => {
      req = {};
      setInternationalPhoneNumberSupportMiddleware(
        req as Request,
        res as Response,
        next
      );
      expect(next).to.have.been.called;
    });
  });
});
