import { describe } from "mocha";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import { expect } from "chai";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createPasskeyCallbackGet } from "../create-passkey-callback-controller.js";
import { AMC_SCOPE } from "../types.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import { strict as assert } from "assert";
import { BadRequestError } from "../../../utils/error.js";

const createMockService = (success: boolean, data?: any) => {
  return {
    getAMCResult: sinon.fake.resolves({
      success,
      data,
    }),
  };
};

describe("create-passkey-callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const { sessionId, clientSessionId, diPersistentSessionId } = commonVariables;
  const AUTH_CODE = "test-code";
  const STATE = "test-state";
  const LANGUAGE = "en";
  const USED_REDIRECT_URL = "https://www.test.com/create-passkey-callback";

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CREATE_PASSKEY_CALLBACK);
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

  describe("create-passkey-callback-controller", () => {
    describe("validation", () => {
      it("should throw BadRequestError if result was not successful", async () => {
        const expectedError = {
          code: 1001,
          message: "Some error message",
        };
        const fakeService = createMockService(false, expectedError);

        await assert.rejects(
          async () =>
            createPasskeyCallbackGet(fakeService)(
              req as Request,
              res as Response
            ),
          (error: Error) => {
            expect(error).to.be.instanceOf(BadRequestError);
            expect(error.message).to.equal(
              '400:AMC callback failed: {"code":1001,"message":"Some error message"}'
            );
            return true;
          }
        );

        expect(fakeService.getAMCResult).to.have.been.called;
      });

      it("should throw BadRequestError if result was successful but scope is incorrect", async () => {
        const expectedResult = {
          success: true,
          scope: AMC_SCOPE.ACCOUNT_DELETE,
        };
        const fakeService = createMockService(true, expectedResult);

        await assert.rejects(
          async () =>
            createPasskeyCallbackGet(fakeService)(
              req as Request,
              res as Response
            ),
          (error: Error) => {
            expect(error).to.be.instanceOf(BadRequestError);
            expect(error.message).to.equal(
              "502:Scope should be passkey-create"
            );
            return true;
          }
        );

        expect(fakeService.getAMCResult).to.have.been.called;
      });

      it("should throw BadRequestError if result was successful but error description is unexpected", async () => {
        const expectedResult = {
          success: false,
          scope: AMC_SCOPE.PASSKEY_CREATE,
          journeys: [
            {
              journey: AMC_SCOPE.PASSKEY_CREATE,
              details: {
                error: {
                  code: 1,
                  description: "InvalidErrorDescription",
                },
              },
            },
          ],
        };
        const fakeService = createMockService(true, expectedResult);

        await assert.rejects(
          async () =>
            createPasskeyCallbackGet(fakeService)(
              req as Request,
              res as Response
            ),
          (error: Error) => {
            expect(error).to.be.instanceOf(BadRequestError);
            expect(error.message).to.equal(
              "500:Unexpected error description: InvalidErrorDescription"
            );
            return true;
          }
        );

        expect(fakeService.getAMCResult).to.have.been.called;
      });
    });

    describe("successful response", () => {
      [
        {
          resultFromAmc: {
            success: true,
            scope: AMC_SCOPE.PASSKEY_CREATE,
          },
          expectedRedirectUri: PATH_NAMES.AUTH_CODE,
        },
        {
          resultFromAmc: {
            success: false,
            scope: AMC_SCOPE.PASSKEY_CREATE,
            journeys: [buildJourneyDetails("UserBackedOutOfJourney")],
          },
          expectedRedirectUri: PATH_NAMES.CREATE_PASSKEY,
        },
        {
          resultFromAmc: {
            success: false,
            scope: AMC_SCOPE.PASSKEY_CREATE,
            journeys: [buildJourneyDetails("UserAbortedJourney")],
          },
          expectedRedirectUri: PATH_NAMES.AUTH_CODE,
        },
      ].forEach(({ resultFromAmc, expectedRedirectUri }) => {
        it(`should redirect to ${expectedRedirectUri} given the journey outcome when create-passkey response is 200`, async () => {
          const fakeService = createMockService(true, resultFromAmc);

          await createPasskeyCallbackGet(fakeService)(
            req as Request,
            res as Response
          );

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
          expect(res.redirect).to.have.been.calledWith(expectedRedirectUri);
        });
      });
    });
  });

  function buildJourneyDetails(description: string) {
    return {
      journey: AMC_SCOPE.PASSKEY_CREATE,
      details: {
        error: {
          code: 1,
          description,
        },
      },
    };
  }
});
