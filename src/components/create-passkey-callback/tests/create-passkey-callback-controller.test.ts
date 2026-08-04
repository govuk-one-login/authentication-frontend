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
import type { UpdateProfileServiceInterface } from "../../common/update-profile/types.js";
import { UpdateType } from "../../common/update-profile/types.js";

const userAbortedJourneyResponse = {
  success: false,
  scope: AMC_SCOPE.PASSKEY_CREATE,
  actions: [buildActionDetails("UserAbortedJourney")],
};

const userBackedOutOfJourneyResponse = {
  success: false,
  scope: AMC_SCOPE.PASSKEY_CREATE,
  actions: [buildActionDetails("UserBackedOutOfJourney")],
};

const passkeySuccessfullyCreatedResponse = {
  success: true,
  scope: AMC_SCOPE.PASSKEY_CREATE,
};

const userHasBlockedInterventionsResponse = {
  success: false,
  scope: AMC_SCOPE.PASSKEY_CREATE,
  actions: [buildAccountInterventionsFailureDetails(true, false, false, false)],
};

describe("create-passkey-callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  let successfulUpdateProfileService: UpdateProfileServiceInterface;

  const { sessionId, clientSessionId, diPersistentSessionId } = commonVariables;
  const AUTH_CODE = "test-code";
  const STATE = "test-state";
  const LANGUAGE = "en";
  const USED_REDIRECT_URL = "https://www.test.com/create-passkey-callback";
  const EMAIL = "test@test.com";

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CREATE_PASSKEY_CALLBACK);
    req.session.user.email = EMAIL;
    req.query = { code: AUTH_CODE, state: STATE };
    req.cookies = { lng: LANGUAGE };
    res = mockResponse();
    res.locals = {
      sessionId,
      clientSessionId,
      persistentSessionId: diPersistentSessionId,
      currentUrl: new URL(USED_REDIRECT_URL + "?code=123&state=abc"),
    };
    successfulUpdateProfileService = fakeUpdateProfileService(true);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("create-passkey-callback-controller", () => {
    describe("validation", () => {
      it("should throw BadRequestError if result was not successful", async () => {
        const responseFromAmc = {
          code: 1001,
          message: "Some error message",
        };
        const fakeService = fakeAmcService(false, responseFromAmc);

        await assert.rejects(
          async () =>
            createPasskeyCallbackGet(
              fakeService,
              successfulUpdateProfileService
            )(req as Request, res as Response),
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
        const responseFromAmc = {
          success: true,
          scope: AMC_SCOPE.ACCOUNT_DELETE,
        };
        const fakeService = fakeAmcService(true, responseFromAmc);

        await assert.rejects(
          async () =>
            createPasskeyCallbackGet(
              fakeService,
              successfulUpdateProfileService
            )(req as Request, res as Response),
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
        const responseFromAmc = {
          success: false,
          scope: AMC_SCOPE.PASSKEY_CREATE,
          actions: [
            {
              action: AMC_SCOPE.PASSKEY_CREATE,
              details: {
                error: {
                  code: 1,
                  description: "InvalidErrorDescription",
                },
              },
            },
          ],
        };
        const fakeService = fakeAmcService(true, responseFromAmc);

        await assert.rejects(
          async () =>
            createPasskeyCallbackGet(
              fakeService,
              successfulUpdateProfileService
            )(req as Request, res as Response),
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
          resultFromAmc: passkeySuccessfullyCreatedResponse,
          expectedRedirectUri: PATH_NAMES.PASSKEY_CREATED,
        },
        {
          resultFromAmc: userBackedOutOfJourneyResponse,
          expectedRedirectUri: PATH_NAMES.CREATE_PASSKEY,
        },
        {
          resultFromAmc: userAbortedJourneyResponse,
          expectedRedirectUri: PATH_NAMES.AUTH_CODE,
        },
      ].forEach(({ resultFromAmc, expectedRedirectUri }) => {
        it(`should redirect to ${expectedRedirectUri} given the journey outcome when create-passkey response is 200`, async () => {
          const fakeService = fakeAmcService(true, resultFromAmc);

          await createPasskeyCallbackGet(
            fakeService,
            successfulUpdateProfileService
          )(req as Request, res as Response);

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

      [
        {
          scenarioName: "created successfully",
          resultFromAmc: passkeySuccessfullyCreatedResponse,
          sessionAssertion: (req: Request) =>
            req.session.user.hasSkippedPasskeyRegistration == undefined &&
            req.session.user
              .accountInterventionAppliedDuringPasskeyRegistration == undefined,
          shouldCallUpdateProfile: false,
        },
        {
          scenarioName: "backed out of journey",
          resultFromAmc: userBackedOutOfJourneyResponse,
          sessionAssertion: (req: Request) =>
            req.session.user.hasSkippedPasskeyRegistration == undefined &&
            req.session.user
              .accountInterventionAppliedDuringPasskeyRegistration == undefined,
          shouldCallUpdateProfile: false,
        },
        {
          scenarioName: "user aborted journey",
          resultFromAmc: userAbortedJourneyResponse,
          sessionAssertion: (req: Request) =>
            req.session.user.hasSkippedPasskeyRegistration == true &&
            req.session.user
              .accountInterventionAppliedDuringPasskeyRegistration == undefined,
          shouldCallUpdateProfile: true,
        },
        {
          scenarioName: "user has intervention",
          resultFromAmc: userHasBlockedInterventionsResponse,
          sessionAssertion: (req: Request) =>
            req.session.user.hasSkippedPasskeyRegistration == undefined &&
            req.session.user
              .accountInterventionAppliedDuringPasskeyRegistration == true,
          shouldCallUpdateProfile: false,
        },
      ].forEach(
        ({
          scenarioName,
          resultFromAmc,
          sessionAssertion,
          shouldCallUpdateProfile,
        }) => {
          it(`should save the relevant information on the session and user profile given the response from amc is ${scenarioName}`, async () => {
            const amcService = fakeAmcService(true, resultFromAmc);

            await createPasskeyCallbackGet(
              amcService,
              successfulUpdateProfileService
            )(req as Request, res as Response);

            expect(amcService.getAMCResult).to.have.been.calledWith(
              sessionId,
              clientSessionId,
              diPersistentSessionId,
              req,
              AUTH_CODE,
              STATE,
              USED_REDIRECT_URL,
              LANGUAGE
            );
            expect(sessionAssertion(req)).to.be.true;
            expect(req.session.save).to.have.been.called;

            if (shouldCallUpdateProfile) {
              expect(
                successfulUpdateProfileService.updateProfile
              ).to.have.been.calledWith(
                sessionId,
                clientSessionId,
                EMAIL,
                UpdateType.SKIP_ADDING_PASSKEY,
                diPersistentSessionId,
                req
              );
            } else {
              expect(successfulUpdateProfileService.updateProfile).not.to.have
                .been.called;
            }
          });
        }
      );

      it("should not throw error if the call to the update profile service fails", async () => {
        const updateProfileReturnsSuccess = false;
        const unsucessfulUpdateProfileService = fakeUpdateProfileService(
          updateProfileReturnsSuccess
        );

        const amcService = fakeAmcService(true, userAbortedJourneyResponse);

        await createPasskeyCallbackGet(
          amcService,
          unsucessfulUpdateProfileService
        )(req as Request, res as Response);

        expect(amcService.getAMCResult).to.have.been.called;

        expect(unsucessfulUpdateProfileService.updateProfile).to.have.been
          .called;

        expect(req.log.warn).to.have.been.calledOnce;

        expect(req.session.user.hasSkippedPasskeyRegistration).to.be.true;
        expect(req.session.save).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
      });

      [
        {
          blocked: true,
          suspended: false,
          reproveIdentity: false,
          resetPassword: false,
        },
        {
          blocked: false,
          suspended: true,
          reproveIdentity: false,
          resetPassword: false,
        },
        {
          blocked: false,
          suspended: true,
          reproveIdentity: true,
          resetPassword: false,
        },
        {
          blocked: false,
          suspended: true,
          reproveIdentity: false,
          resetPassword: true,
        },
        {
          blocked: false,
          suspended: true,
          reproveIdentity: true,
          resetPassword: true,
        },
      ].forEach(({ blocked, suspended, reproveIdentity, resetPassword }) => {
        it(`should redirect to auth code for result indicating account interventions: blocked ${blocked}, suspended ${suspended}, reproveIdentity ${reproveIdentity}, resetPassword ${resetPassword}`, async () => {
          const resultFromAmc = {
            success: false,
            scope: AMC_SCOPE.PASSKEY_CREATE,
            actions: [
              buildAccountInterventionsFailureDetails(
                blocked,
                suspended,
                reproveIdentity,
                resetPassword
              ),
            ],
          };
          const fakeService = fakeAmcService(true, resultFromAmc);

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
          expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
        });
      });
    });
  });
});

function buildAccountInterventionsFailureDetails(
  blocked: boolean,
  suspended: boolean,
  reproveIdentity: boolean,
  resetPassword: boolean
) {
  return {
    action: AMC_SCOPE.PASSKEY_CREATE,
    details: {
      accountInterventionsStatus: {
        state: {
          blocked: blocked,
          reproveIdentity: reproveIdentity,
          resetPassword: resetPassword,
          suspended: suspended,
        },
      },
      error: {
        code: 1004,
        description: "AccountHasInterventions",
      },
    },
  };
}

function fakeAmcService(success: boolean, data?: any) {
  return {
    getAMCResult: sinon.fake.resolves({
      success,
      data,
    }),
  };
}

function fakeUpdateProfileService(
  returnSuccess: boolean
): UpdateProfileServiceInterface {
  return {
    updateProfile: sinon.fake.returns({
      success: returnSuccess,
    }),
  } as unknown as UpdateProfileServiceInterface;
}

function buildActionDetails(description: string) {
  return {
    action: AMC_SCOPE.PASSKEY_CREATE,
    details: {
      error: {
        code: 1,
        description,
      },
    },
  };
}
