import type { NextFunction, Request, Response } from "express";
import { describe } from "mocha";
import { sanitizeRequestMiddleware } from "../../../src/middleware/sanitize-request-middleware.js";
import { expect, sinon } from "../../utils/test-utils.js";
import { mockRequest, mockResponse } from "mock-req-res";

describe("sanitize-request-middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = sinon.fake() as unknown as NextFunction;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("sanitizeRequestMiddleware", () => {
    it("should not change input when no xss present", () => {
      req = { body: { name: "Test123" } } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).to.eql("Test123");
      expect(next).to.be.called;
    });

    it("should remove entire script block returning an empty string", () => {
      req = {
        body: { name: "<SCRIPT SRC=http://xss.rocks/xss.js></SCRIPT>" },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).to.eql("");
      expect(next).to.be.called;
    });

    it("should remove entire input returning an empty string", () => {
      req = {
        body: { name: '<INPUT TYPE="IMAGE" SRC="javascript:alert(\'XSS\');">' },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).to.eql("");
      expect(next).to.be.called;
    });

    it("handles multiple fields", () => {
      req = { body: { name: "Test12", email: "test@test.com" } } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).to.eql("Test12");
      expect(req.body.email).to.eql("test@test.com");
      expect(next).to.be.called;
    });

    it("should trim whitespace from form field", () => {
      req = { body: { name: "    James Mc'oy \n\t" } } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).to.eql("James Mc'oy");
      expect(next).to.be.called;
    });
  });
});
