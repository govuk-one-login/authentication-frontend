import { expect } from "chai";
import { describe } from "mocha";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { ssadCallbackGet } from "../ssad-callback-controller.js";
import { BadRequestError } from "../../../utils/error.js";
import sinon from "sinon";
import type { Request, Response } from "express";
import { strict as assert } from "assert";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";

const amcOutcome = (scope: string, success: boolean) => ({
  sub: "test-sub",
  outcome_id: "test-outcome-id",
  email: "test@test.com",
  scope,
  success,
  actions: [],
});

const createMockService = (success: boolean, data: unknown) => {
  return {
    getAMCResult: sinon.fake.resolves({
      success,
      data,
    }),
  };
};

describe("ssad-callback-controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const { sessionId, clientSessionId, diPersistentSessionId } = commonVariables;
  const AUTH_CODE = "test-code";
  const STATE = "test-state";
  const LANGUAGE = "en";
  const USED_REDIRECT_URL = "https://www.test.com/amc-callback";

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.SSAD_CALLBACK);
    req.query = { code: AUTH_CODE, state: STATE };
    req.cookies = { lng: LANGUAGE };
    res = mockResponse();
    res.locals = {
      sessionId,
      clientSessionId,
      persistentSessionId: diPersistentSessionId,
      currentUrl: new URL(USED_REDIRECT_URL + "?code=123&state=abc"),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should redirect to the account deleted page when the account was deleted", async () => {
    const fakeService = createMockService(
      true,
      amcOutcome("account-delete", true)
    );

    await ssadCallbackGet(fakeService)(req as Request, res as Response);

    expect(fakeService.getAMCResult).to.have.been.calledWith(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      AUTH_CODE,
      STATE,
      USED_REDIRECT_URL,
      LANGUAGE
    );
    expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ACCOUNT_DELETED);
  });

  it("should return the outcome when the account was not deleted", async () => {
    const outcome = amcOutcome("account-delete", false);
    const fakeService = createMockService(true, outcome);

    await ssadCallbackGet(fakeService)(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ message: outcome });
    expect(res.redirect).not.to.have.been.called;
  });

  it("should raise error when the scope is not account-delete", async () => {
    const fakeService = createMockService(
      true,
      amcOutcome("passkey-create", true)
    );

    await assert.rejects(
      async () => ssadCallbackGet(fakeService)(req as Request, res as Response),
      (error: Error) => {
        expect(error).to.be.instanceOf(BadRequestError);
        expect(error.message).to.equal("502:Scope should be account-delete");
        return true;
      }
    );
  });

  it("should raise error when service call fails", async () => {
    const expectedErrorMessage = "error message";
    const fakeService = createMockService(false, expectedErrorMessage);

    await assert.rejects(
      async () => ssadCallbackGet(fakeService)(req as Request, res as Response),
      (error: Error) => {
        expect(error).to.be.instanceOf(BadRequestError);
        expect(error.message).to.equal(
          "400:AMC callback failed: " + expectedErrorMessage
        );
        return true;
      }
    );

    expect(fakeService.getAMCResult).to.have.been.called;
  });

  it("should raise error when query params are missing or invalid", async () => {
    const missingOrInvalidQueries = [
      {
        query: { state: STATE },
        expectedMessage: "400:Request query missing auth code param",
      },
      {
        query: { code: ["array"], state: STATE },
        expectedMessage: "400:Invalid auth code param type",
      },
      {
        query: { code: AUTH_CODE },
        expectedMessage: "400:Request query missing state param",
      },
      {
        query: { code: AUTH_CODE, state: ["array"] },
        expectedMessage: "400:Invalid state param type",
      },
    ];

    for (const testCase of missingOrInvalidQueries) {
      req.query = testCase.query;

      await assert.rejects(
        async () => ssadCallbackGet()(req as Request, res as Response),
        (error: Error) => {
          expect(error).to.be.instanceOf(BadRequestError);
          expect(error.message).to.equal(testCase.expectedMessage);
          return true;
        }
      );
    }
  });
});
