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
        expected: true,
      },
      {
        browserSupportsWebAuthn: false,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: true,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: true,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: true,
        supportPasskeyRegistration: true,
        expected: false,
      },
      {
        browserSupportsWebAuthn: true,
        hasActivePasskey: false,
        hasSkippedPasskeyRegistration: false,
        supportPasskeyRegistration: false,
        expected: false,
      },
    ];

    testCases.forEach(
      ({
        browserSupportsWebAuthn,
        hasActivePasskey,
        hasSkippedPasskeyRegistration,
        supportPasskeyRegistration,
        expected,
      }) => {
        it(`should return ${expected} when browserSupportsWebAuthn=${browserSupportsWebAuthn}, hasActivePasskey=${hasActivePasskey}, hasSkippedPasskeyRegistration=${hasSkippedPasskeyRegistration}, supportPasskeyRegistration=${supportPasskeyRegistration}`, () => {
          const req = {
            session: {
              user: {
                browserSupportsWebAuthn,
                hasActivePasskey,
                hasSkippedPasskeyRegistration,
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
