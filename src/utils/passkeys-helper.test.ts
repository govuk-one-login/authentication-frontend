import { describe } from "mocha";
import {
  shouldPromptToRegisterPasskey,
  shouldPromptToSignInWithPasskey,
} from "./passkeys-helper.js";
import { expect } from "chai";
import type { Request, Response } from "express";

describe("passkeys helper", () => {
  describe("shouldPromptToRegisterPasskey", () => {
    it(`should return true when hasActivePasskey=false and supportPasskeyRegistration=true`, () => {
      // Arrange
      const expected = true;

      const req = {
        session: { user: { hasActivePasskey: false } },
      } as any as Request;

      const res = {
        locals: { supportPasskeyRegistration: true },
      } as any as Response;

      // Act
      const actual = shouldPromptToRegisterPasskey(req, res);

      // Assert
      expect(actual).to.eq(expected);
    });
  });

  describe("shouldPromptToSignInWithPasskey", () => {
    it(`should return true when hasActivePasskey=true and supportPasskeyUsage=true`, () => {
      // Arrange
      const expected = true;

      const req = {
        session: { user: { hasActivePasskey: true } },
      } as any as Request;

      const res = {
        locals: { supportPasskeyUsage: true },
      } as any as Response;

      // Act
      const actual = shouldPromptToSignInWithPasskey(req, res);

      // Assert
      expect(actual).to.eq(expected);
    });
  });
});
