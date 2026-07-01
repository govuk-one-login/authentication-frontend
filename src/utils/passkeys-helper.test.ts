import { describe } from "mocha";
import {
  shouldPromptToRegisterPasskey,
  shouldPromptToSignInWithPasskey,
} from "./passkeys-helper.js";
import { expect } from "chai";
import type { Request, Response } from "express";

describe("passkeys helper", () => {
  describe("shouldPromptToRegisterPasskey", () => {
    const testCases = [
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        rpClientId: "valid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: false,
        expected: true,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        rpClientId: "valid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: null,
        expected: true,
      },
      {
        browserSupportsWebAuthn: false,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        rpClientId: "invalid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: false,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: true,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        rpClientId: "invalid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: false,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: true,
        supportPasskeyRegistration: true,
        rpClientId: "invalid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: false,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: false,
        rpClientId: "invalid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: false,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        reauthenticate: "12345",
        rpClientId: "invalid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: false,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        rpClientId: "invalid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: false,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: null,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        rpClientId: "valid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: false,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        rpClientId: "valid-rp-client-id",
        backendIndicatesPasskeyPromptShouldBeSkipped: true,
        expected: false,
      },
    ];

    testCases.forEach(
      ({
        browserSupportsWebAuthn,
        hasActivePasskey,
        hasSkippedPasskeyRegistration,
        supportPasskeyRegistration,
        reauthenticate,
        rpClientId,
        backendIndicatesPasskeyPromptShouldBeSkipped,
        expected,
      }) => {
        it(`should return ${expected} when browserSupportsWebAuthn=${browserSupportsWebAuthn}, hasActivePasskey=${hasActivePasskey}, hasSkippedPasskeyRegistration=${hasSkippedPasskeyRegistration}, supportPasskeyRegistration=${supportPasskeyRegistration}, reauthenticate=${reauthenticate}, rpClientId=${rpClientId}, backendIndicatesPasskeyPromptShouldBeSkipped=${backendIndicatesPasskeyPromptShouldBeSkipped}`, () => {
          process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST = "valid-rp-client-id";

          const req = {
            session: {
              user: {
                browserSupportsWebAuthn,
                hasActivePasskey,
                hasSkippedPasskeyRegistration,
                reauthenticate,
                backendIndicatesPasskeyPromptShouldBeSkipped,
                isPasswordResetJourney: false,
                withinForcedPasswordResetJourney: false,
                isCommonPasswordResetJourney: false,
              },
              client: {
                rpClientId: rpClientId,
              },
            },
          } as any as Request;
          const res = {
            locals: { supportPasskeyRegistration },
          } as any as Response;

          expect(shouldPromptToRegisterPasskey(req, res)).to.eq(expected);
        });
      }
    );

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
      }) => {
        it(`should return ${expectedShouldPromptToRegister} when passwordResetJourney=${isPasswordResetJourney}, withinForcedPasswordResetJourney=${withinForcedPasswordResetJourney} and isCommonPasswordResetJourney=${isCommonPasswordResetJourney}`, () => {
          process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST = "valid-rp-client-id";

          const req = {
            session: {
              user: {
                browserSupportsWebAuthn: true,
                hasActivePasskey: false,
                hasSkippedPasskeyRegistration: false,
                reauthenticate: false,
                backendIndicatesPasskeyPromptShouldBeSkipped: false,
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
      }) => {
        it(`should return ${expected} when browserSupportsWebAuthn=${browserSupportsWebAuthn}, hasActivePasskey=${hasActivePasskey}, supportPasskeyUsage=${supportPasskeyUsage}`, () => {
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
});
