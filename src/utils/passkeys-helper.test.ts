import { describe } from "mocha";
import {
  shouldPromptToRegisterPasskey,
  shouldPromptToSignInWithPasskey,
  isInPasskeyPhasedRollout,
} from "./passkeys-helper.js";
import { expect, sinon } from "../../test/utils/test-utils.js";
import type { Request, Response } from "express";

describe("passkeys helper", () => {
  describe("shouldPromptToRegisterPasskey", () => {
    const testCases = [
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          rpClientId: "valid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: true,
        },
        expected: true,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          rpClientId: "valid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: null,
          isInPasskeyPhasedRollout: true,
        },
        expected: true,
      },
      {
        conditions: {
          browserSupportsWebAuthn: false,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          rpClientId: "invalid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: true,
        },
        expected: false,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: true,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          rpClientId: "invalid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: true,
        },
        expected: false,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: true,
          supportPasskeyRegistration: true,
          rpClientId: "invalid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: true,
        },
        expected: false,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: false,
          rpClientId: "invalid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: true,
        },
        expected: false,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          reauthenticate: "12345",
          rpClientId: "invalid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: true,
        },
        expected: false,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          rpClientId: "invalid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: true,
        },
        expected: false,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: null,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          rpClientId: "valid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: true,
        },
        expected: false,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          rpClientId: "valid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: true,
          isInPasskeyPhasedRollout: true,
        },
        expected: false,
      },
      {
        conditions: {
          browserSupportsWebAuthn: true,
          hasActivePasskey: false,
          hasSkippedPasskeyRegistration: false,
          supportPasskeyRegistration: true,
          rpClientId: "valid-rp-client-id",
          backendIndicatesPasskeyPromptShouldBeSkipped: false,
          isInPasskeyPhasedRollout: false,
        },
        expected: false,
      },
    ];

    testCases.forEach(({ conditions, expected }, index) => {
      it(`[${index}] should return ${expected} when conditions=${JSON.stringify(conditions)}`, () => {
        process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST = "valid-rp-client-id";

        const req = {
          session: {
            user: {
              browserSupportsWebAuthn: conditions.browserSupportsWebAuthn,
              hasActivePasskey: conditions.hasActivePasskey,
              hasSkippedPasskeyRegistration:
                conditions.hasSkippedPasskeyRegistration,
              reauthenticate: conditions.reauthenticate,
              backendIndicatesPasskeyPromptShouldBeSkipped:
                conditions.backendIndicatesPasskeyPromptShouldBeSkipped,
              isInPasskeyPhasedRollout: conditions.isInPasskeyPhasedRollout,
              isPasswordResetJourney: false,
              withinForcedPasswordResetJourney: false,
              isCommonPasswordResetJourney: false,
              isMfaRequired: true,
              isUpliftRequired: false,
            },
            client: {
              rpClientId: conditions.rpClientId,
            },
          },
        } as any as Request;
        const res = {
          locals: {
            supportPasskeyRegistration: conditions.supportPasskeyRegistration,
          },
        } as any as Response;

        expect(shouldPromptToRegisterPasskey(req, res)).to.eq(expected);
      });
    });

    describe("shouldPromptToRegisterPasskeyDependingOnAllowlistAndDenylist", () => {
      const testCases = [
        {
          description:
            "rpClientId is on the deny list even if on the allow list",
          allowList: "valid-rp-client-id",
          denyList: "valid-rp-client-id",
          expected: false,
        },
        {
          description:
            "rpClientId is on the deny list even if on the allow list with multiple entries",
          allowList: "other-client-id,valid-rp-client-id,another-client-id",
          denyList: "valid-rp-client-id",
          expected: false,
        },
        {
          description:
            "rpClientId is on the allow list but not on the deny list",
          allowList: "other-client-id,valid-rp-client-id,another-client-id",
          denyList: "some-other-client-id",
          expected: true,
        },
        {
          description: "allowList is empty",
          allowList: "",
          denyList: "some-other-client-id",
          expected: false,
        },
        {
          description: "denyList is empty",
          allowList: "valid-rp-client-id",
          denyList: "",
          expected: true,
        },
        {
          description: "both allowList and denyList are empty",
          allowList: "",
          denyList: "",
          expected: false,
        },
      ];

      testCases.forEach(({ description, allowList, denyList, expected }, index) => {
        it(`[${index}] should return ${expected} when ${description}`, () => {
          process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST = allowList;
          process.env.PASSKEY_PROMPT_CLIENT_DENY_LIST = denyList;

          const req = {
            session: {
              user: {
                browserSupportsWebAuthn: true,
                hasActivePasskey: false,
                hasSkippedPasskeyRegistration: false,
                backendIndicatesPasskeyPromptShouldBeSkipped: false,
                reauthenticate: false,
                isMfaRequired: true,
                isUpliftRequired: false,
                isInPasskeyPhasedRollout: true,
                isPasswordResetJourney: false,
                withinForcedPasswordResetJourney: false,
                isCommonPasswordResetJourney: false,
              },
              client: {
                rpClientId: "valid-rp-client-id",
              },
            },
          } as any as Request;
          const res = {
            locals: { supportPasskeyRegistration: true },
          } as any as Response;

          expect(shouldPromptToRegisterPasskey(req, res)).to.eq(expected);
        });
      });
    });

    const passwordResetTestCases = [
      {
        isPasswordResetJourney: false,
        withinForcedPasswordResetJourney: false,
        isCommonPasswordResetJourney: false,
        expectedShouldPromptToRegister: true,
      },
      {
        isPasswordResetJourney: null,
        withinForcedPasswordResetJourney: null,
        isCommonPasswordResetJourney: null,
        expectedShouldPromptToRegister: true,
      },
      {
        isPasswordResetJourney: true,
        withinForcedPasswordResetJourney: false,
        isCommonPasswordResetJourney: false,
        expectedShouldPromptToRegister: false,
      },
      {
        isPasswordResetJourney: false,
        withinForcedPasswordResetJourney: true,
        isCommonPasswordResetJourney: false,
        expectedShouldPromptToRegister: false,
      },
      {
        isPasswordResetJourney: false,
        withinForcedPasswordResetJourney: false,
        isCommonPasswordResetJourney: true,
        expectedShouldPromptToRegister: false,
      },
    ];

    passwordResetTestCases.forEach(
      ({
        isPasswordResetJourney,
        withinForcedPasswordResetJourney,
        isCommonPasswordResetJourney,
        expectedShouldPromptToRegister,
      }, index) => {
        it(`[${index}] should return ${expectedShouldPromptToRegister} when passwordResetJourney=${isPasswordResetJourney}, withinForcedPasswordResetJourney=${withinForcedPasswordResetJourney} and isCommonPasswordResetJourney=${isCommonPasswordResetJourney}`, () => {
          process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST = "valid-rp-client-id";

          const req = {
            session: {
              user: {
                browserSupportsWebAuthn: true,
                hasActivePasskey: false,
                hasSkippedPasskeyRegistration: false,
                reauthenticate: false,
                backendIndicatesPasskeyPromptShouldBeSkipped: false,
                isMfaRequired: true,
                isUpliftRequired: false,
                isInPasskeyPhasedRollout: true,
                isPasswordResetJourney,
                withinForcedPasswordResetJourney,
                isCommonPasswordResetJourney,
              },
              client: {
                rpClientId: "valid-rp-client-id",
              },
            },
          } as any as Request;
          const res = {
            locals: { supportPasskeyRegistration: true },
          } as any as Response;

          expect(shouldPromptToRegisterPasskey(req, res)).to.eq(
            expectedShouldPromptToRegister
          );
        });
      }
    );

    const mfaVariantTestCases = [
      {
        isMfaRequired: true,
        isUpliftRequired: false,
        expectedShouldPromptToRegister: true,
      },
      {
        isMfaRequired: false,
        isUpliftRequired: false,
        expectedShouldPromptToRegister: false,
      },
      {
        isMfaRequired: true,
        isUpliftRequired: true,
        expectedShouldPromptToRegister: false,
      },
    ];
    mfaVariantTestCases.forEach(
      ({ isMfaRequired, isUpliftRequired, expectedShouldPromptToRegister }, index) => {
        it(`[${index}] should return ${expectedShouldPromptToRegister} when isMfaRequired=${isMfaRequired} and isUpliftRequired=${isUpliftRequired}`, () => {
          process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST = "valid-rp-client-id";

          const req = {
            session: {
              user: {
                isMfaRequired: isMfaRequired,
                isUpliftRequired: isUpliftRequired,
                browserSupportsWebAuthn: true,
                hasActivePasskey: false,
                hasSkippedPasskeyRegistration: false,
                reauthenticate: false,
                backendIndicatesPasskeyPromptShouldBeSkipped: false,
                isPasswordResetJourney: false,
                withinForcedPasswordResetJourney: false,
                isCommonPasswordResetJourney: false,
                isInPasskeyPhasedRollout: true,
              },
              client: {
                rpClientId: "valid-rp-client-id",
              },
            },
          } as any as Request;
          const res = {
            locals: { supportPasskeyRegistration: true },
          } as any as Response;

          expect(shouldPromptToRegisterPasskey(req, res)).to.eq(
            expectedShouldPromptToRegister
          );
        });
      }
    );
  });

  describe("shouldPromptToSignInWithPasskey", () => {
    const testCases = [
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: true,
        supportPasskeyUsage: true,
        expected: true,
      },
      {
        browserSupportsWebAuthn: false,
        hasActivePasskey: true,
        supportPasskeyUsage: true,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        supportPasskeyUsage: true,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: true,
        supportPasskeyUsage: false,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: null,
        supportPasskeyUsage: true,
        expected: false,
      },
    ];

    testCases.forEach(
      ({
        browserSupportsWebAuthn,
        hasActivePasskey,
        supportPasskeyUsage,
        expected,
      }, index) => {
        it(`[${index}] should return ${expected} when browserSupportsWebAuthn=${browserSupportsWebAuthn}, hasActivePasskey=${hasActivePasskey}, supportPasskeyUsage=${supportPasskeyUsage}`, () => {
          const req = {
            session: { user: { browserSupportsWebAuthn, hasActivePasskey } },
          } as any as Request;
          const res = {
            locals: { supportPasskeyUsage },
          } as any as Response;

          expect(shouldPromptToSignInWithPasskey(req, res)).to.eq(expected);
        });
      }
    );
  });

  describe("isInPasskeyPhasedRollout", () => {
    let mathRandomStub: sinon.SinonStub;

    afterEach(() => {
      mathRandomStub?.restore();
      delete process.env.PASSKEY_ROLLOUT_PERCENTAGE;
    });

    const testCases = [
      {
        rolloutPercentage: undefined,
        randomValue: 0.1,
        expected: false,
      },
      {
        rolloutPercentage: "0",
        randomValue: 0.1,
        expected: false,
      },
      {
        rolloutPercentage: "50",
        randomValue: 0.3,
        expected: true,
      },
      {
        rolloutPercentage: "50",
        randomValue: 0.7,
        expected: false,
      },
      {
        rolloutPercentage: "60",
        randomValue: 0.6,
        expected: true,
      },
      {
        rolloutPercentage: "100",
        randomValue: 0.99,
        expected: true,
      },
      {
        rolloutPercentage: "abc",
        randomValue: 0.1,
        expected: false,
      },
    ];

    testCases.forEach(({ rolloutPercentage, randomValue, expected }, index) => {
      it(`[${index}] should return ${expected} when PASSKEY_ROLLOUT_PERCENTAGE is ${rolloutPercentage} and Math.random returns ${randomValue}`, () => {
        process.env.PASSKEY_ROLLOUT_PERCENTAGE = rolloutPercentage;
        mathRandomStub = sinon.stub(Math, "random").returns(randomValue);

        expect(isInPasskeyPhasedRollout()).to.eq(expected);
      });
    });
  });
});
