import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import sinon from "sinon";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { PATH_NAMES } from "../../../app.constants";
import { expect } from "chai";
import { Request, Response } from "express";
import { ReverificationResultInterface } from "../types";
import { ipvCallbackGet } from "../ipv-callback-controller";
import { BadRequestError } from "../../../utils/error";
import { commonVariables } from "../../../../test/helpers/common-test-variables";

const fakeReverificationResultService = (success: boolean) => {
  const failureData = {
    code: 500,
    message: "Internal error occurred in backend",
  };
  return {
    getReverificationResult: sinon.fake.returns({
      success: success,
      data: success ? { sub: "some-sub", success: true } : failureData,
    }),
  } as unknown as ReverificationResultInterface;
};

describe("ipv callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const { sessionId, clientSessionId, diPersistentSessionId, email } =
    commonVariables;

  const AUTH_CODE = "5678";

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.IPV_CALLBACK);
    req.query = { code: AUTH_CODE };
    req.session.user.email = email;
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

  it("get should return a 200 when the reverification result is successful", async () => {
    const fakeServiceReturningSuccess = fakeReverificationResultService(true);
    await ipvCallbackGet(fakeServiceReturningSuccess)(
      req as Request,
      res as Response
    );

    expect(
      fakeServiceReturningSuccess.getReverificationResult
    ).to.have.been.calledWith(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      email,
      AUTH_CODE
    );
    expect(res.status).to.have.been.calledWith(200);
  });

  it("get should raise error when reverification result is not successful", async () => {
    const fakeServiceReturningFailure = fakeReverificationResultService(false);

    await expect(
      ipvCallbackGet(fakeServiceReturningFailure)(
        req as Request,
        res as Response
      )
    ).to.be.rejectedWith(
      BadRequestError,
      "500:Internal error occurred in backend"
    );

    expect(fakeServiceReturningFailure.getReverificationResult).to.have.been
      .called;
  });

  it("get should raise error when auth code param is missing or invalid", async () => {
    const missingOrInvalidQueries = [
      {
        query: {},
        expectedMessage: "400:Request query missing auth code param",
      },
      {
        query: { code: ["string-in-a-list"] },
        expectedMessage: "400:Invalid auth code param type",
      },
    ];

    for (const testCase of missingOrInvalidQueries) {
      const fakeServiceReturningSuccess = fakeReverificationResultService(true);
      req.query = testCase.query;

      await expect(
        ipvCallbackGet(fakeServiceReturningSuccess)(
          req as Request,
          res as Response
        )
      ).to.be.rejectedWith(BadRequestError, testCase.expectedMessage);
    }
  });
});
