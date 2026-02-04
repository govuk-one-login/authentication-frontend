import { expect } from "chai";
import { describe } from "mocha";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { amcCallbackGet } from "../amc-callback-controller.js";
import { BadRequestError } from "../../../utils/error.js";

describe("amc-callback-controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.AMC_CALLBACK);
    res = mockResponse();
  });

  it("should successfully get amc callback controller", () => {
    req.query = { code: "test-code", state: "test-state" };
    amcCallbackGet(req, res);
    expect(res.status).to.have.been.calledWith(200);
    expect(res.send).to.have.been.calledWith("OK");
  });

  it("should throw BadRequestError when code param is missing", () => {
    req.query = { state: "test-state" };
    expect(() => amcCallbackGet(req, res)).to.throw(
      BadRequestError,
      "Request query missing auth code param"
    );
  });

  it("should throw BadRequestError when code param is not a string", () => {
    req.query = { code: ["array"], state: "test-state" };
    expect(() => amcCallbackGet(req, res)).to.throw(
      BadRequestError,
      "Invalid auth code param type"
    );
  });

  it("should throw BadRequestError when state param is missing", () => {
    req.query = { code: "test-code" };
    expect(() => amcCallbackGet(req, res)).to.throw(
      BadRequestError,
      "Request query missing state param"
    );
  });

  it("should throw BadRequestError when state param is not a string", () => {
    req.query = { code: "test-code", state: ["array"] };
    expect(() => amcCallbackGet(req, res)).to.throw(
      BadRequestError,
      "Invalid state param type"
    );
  });
});
