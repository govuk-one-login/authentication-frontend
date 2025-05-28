import { expect } from "chai";
import type { NextFunction, Request, Response } from "express";
import sinon from "sinon";
import { HTTP_STATUS_CODES } from "../../app.constants.js";
import { csrfMissingHandler } from "../csrf-missing-handler.js";
describe("csrfMissingHandler", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    res = {
      headersSent: false,
      statusCode: 200,
      render: () => {},
      status: function (newStatus: number) {
        this.statusCode = newStatus;
        return this;
      },
      send: sinon.spy(),
    } as unknown as Response;
    next = sinon.spy();
  });

  // TODO: AUT-4272 PR 3: Reinstate this test once csrf validation is re-enabled.
  it.skip("should return unauthorized if the error is a csrf missing error", () => {
    const err = new Error("Invalid CSRF token") as any;
    err.code = "EBADCSRFTOKEN";

    csrfMissingHandler(err, req, res, next);

    expect(res.statusCode).to.equal(HTTP_STATUS_CODES.FORBIDDEN);
    expect(res.send).to.have.been.calledOnceWith(
      "Forbidden: Invalid or missing CSRF token"
    );
    expect(next).not.to.have.been.called;
  });

  it("should call next for any other error", () => {
    const err = new Error("Some other error") as any;
    err.code = "ANOTHER_ERROR";

    csrfMissingHandler(err, req, res, next);

    expect(next).to.have.been.called;
  });
});
