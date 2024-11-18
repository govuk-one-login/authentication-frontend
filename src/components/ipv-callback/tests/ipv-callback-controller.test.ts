import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import sinon from "sinon";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { PATH_NAMES } from "../../../app.constants";
import { expect } from "chai";
import { Request, Response } from "express";
import { ReverificationResultInterface } from "../types";
import { ipvCallbackGet } from "../ipv-callback-controller";

const fakeReverificationResultService = {
  getReverificationResult: sinon.fake.returns({
    success: true,
    data: {},
  }),
} as unknown as ReverificationResultInterface;

describe("ipv callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.IPV_CALLBACK);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("get should return a 200 when the reverification result is successful", async () => {
    await ipvCallbackGet(fakeReverificationResultService)(
      req as Request,
      res as Response
    );

    expect(fakeReverificationResultService.getReverificationResult).to.have.been
      .called;
    expect(res.status).to.have.been.calledWith(200);
  });
});
