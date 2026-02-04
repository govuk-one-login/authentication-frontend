import { expect } from "chai";
import { describe } from "mocha";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { amcCallbackGet } from "../amc-callback-controller.js";
import sinon from "sinon";
import type { Request, Response } from "express";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";

const createMockService = (success: boolean, data: string) => {
  return {
    getAMCResult: sinon.fake.resolves({
      success,
      data,
    }),
  };
};

describe("amc-callback-controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const { sessionId, clientSessionId, diPersistentSessionId } = commonVariables;
  const AUTH_CODE = "test-code";
  const STATE = "test-state";

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.AMC_CALLBACK);
    req.query = { code: AUTH_CODE, state: STATE };
    req.session.id = sessionId;
    res = mockResponse();
    res.locals = {
      sessionId,
      clientSessionId,
      persistentSessionId: diPersistentSessionId,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should successfully return message when service call succeeds", async () => {
    const expectedResult = "Great success";
    const fakeService = createMockService(true, expectedResult);

    await amcCallbackGet(fakeService)(req as Request, res as Response);

    expect(fakeService.getAMCResult).to.have.been.calledWith(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      AUTH_CODE,
      STATE
    );
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ message: expectedResult });
  });

  it("should return error when service call fails", async () => {
    const expectedErrorMessage = "error message";
    const fakeService = createMockService(false, expectedErrorMessage);

    await amcCallbackGet(fakeService)(req as Request, res as Response);

    expect(fakeService.getAMCResult).to.have.been.called;
    expect(res.status).to.have.been.calledWith(400);
    expect(res.json).to.have.been.calledWith({
      error: "AMC callback failed: " + expectedErrorMessage,
    });
  });

  it("should return error when query params are missing or invalid", async () => {
    const missingOrInvalidQueries = [
      {
        query: { state: STATE },
        expectedError: "Request query missing auth code param",
      },
      {
        query: { code: ["array"], state: STATE },
        expectedError: "Invalid auth code param type",
      },
      {
        query: { code: AUTH_CODE },
        expectedError: "Request query missing state param",
      },
      {
        query: { code: AUTH_CODE, state: ["array"] },
        expectedError: "Invalid state param type",
      },
    ];

    for (const testCase of missingOrInvalidQueries) {
      req.query = testCase.query;

      await amcCallbackGet()(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(400);
      expect(res.json).to.have.been.calledWith({
        error: testCase.expectedError,
      });
    }
  });
});
