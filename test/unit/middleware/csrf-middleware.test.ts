import { expect } from "chai";
import { describe } from "mocha";
import { csrfMiddleware } from "../../../src/middleware/csrf-middleware";
import { NextFunction } from "express";
import { sinon } from "../../utils/test-utils";

describe("CSRF middleware", () => {
  it("should add csrf token to request locals", () => {
    const csrfTokenStub = sinon.fake();
    const req: any = { csrfToken: csrfTokenStub };
    const res: any = { locals: {} };
    const nextFunction: NextFunction = sinon.fake();

    csrfMiddleware(req, res, nextFunction);

    expect(csrfTokenStub).to.have.been.called;
    expect(nextFunction).to.have.been.called;
  });
});
