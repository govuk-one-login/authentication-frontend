import { expect } from "chai";
import { describe } from "mocha";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../app.constants.js";
import { ssadCallbackGet } from "../ssad-callback-controller.js";
import { BadRequestError } from "../../../utils/error.js";
import sinon from "sinon";
import type { Request, Response } from "express";
import { strict as assert } from "assert";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";

const amcOutcome = (
  scope: string,
  success: boolean,
  actions: unknown[] = []
) => ({
  sub: "test-sub",
  outcome_id: "test-outcome-id",
  email: "test@test.com",
  scope,
  success,
  actions,
});

const accountDeleteFailure = (description: string) =>
  amcOutcome("account-delete", false, [
    {
      action: "account-delete",
      startedAt: 1,
      completedAt: 1,
      success: false,
      details: { error: { code: 1001, description } },
    },
  ]);

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

  [
    {
      description: "UserBackedOutOfJourney",
      mfaMethodType: MFA_METHOD_TYPE.SMS,
      expectedPath: PATH_NAMES.ENTER_MFA,
    },
    {
      description: "UserAbortedJourney",
      mfaMethodType: MFA_METHOD_TYPE.SMS,
      expectedPath: PATH_NAMES.ENTER_MFA,
    },
    {
      description: "UserBackedOutOfJourney",
      mfaMethodType: MFA_METHOD_TYPE.AUTH_APP,
      expectedPath: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
    },
    {
      description: "UserAbortedJourney",
      mfaMethodType: MFA_METHOD_TYPE.AUTH_APP,
      expectedPath: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
    },
  ].forEach(({ description, mfaMethodType, expectedPath }) => {
    it(`should redirect an ${mfaMethodType} user to ${expectedPath} when AMC returns ${description}`, async () => {
      req.session.user.mfaMethodType = mfaMethodType;
      const fakeService = createMockService(
        true,
        accountDeleteFailure(description)
      );

      await ssadCallbackGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(expectedPath);
    });
  });

  it("should raise error when AMC returns an unexpected error description", async () => {
    req.session.user.mfaMethodType = MFA_METHOD_TYPE.SMS;
    const fakeService = createMockService(
      true,
      accountDeleteFailure("JourneyFailed")
    );

    await assert.rejects(
      async () => ssadCallbackGet(fakeService)(req as Request, res as Response),
      (error: Error) => {
        expect(error).to.be.instanceOf(BadRequestError);
        expect(error.message).to.equal(
          "500:Unexpected error description: JourneyFailed"
        );
        return true;
      }
    );
    expect(res.redirect).not.to.have.been.called;
  });

  it("should raise error when AMC returns no account-delete action", async () => {
    req.session.user.mfaMethodType = MFA_METHOD_TYPE.SMS;
    const fakeService = createMockService(
      true,
      amcOutcome("account-delete", false)
    );

    await assert.rejects(
      async () => ssadCallbackGet(fakeService)(req as Request, res as Response),
      (error: Error) => {
        expect(error).to.be.instanceOf(BadRequestError);
        expect(error.message).to.equal(
          "500:Unexpected error description: undefined"
        );
        return true;
      }
    );
    expect(res.redirect).not.to.have.been.called;
  });

  it("should raise error when the user has no mfaMethodType", async () => {
    const fakeService = createMockService(
      true,
      accountDeleteFailure("UserBackedOutOfJourney")
    );

    await assert.rejects(
      async () => ssadCallbackGet(fakeService)(req as Request, res as Response),
      (error: Error) => {
        expect(error.message).to.equal("Invalid mfaMethodType: undefined");
        return true;
      }
    );
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
