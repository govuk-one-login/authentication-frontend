import { expect } from "chai";
import { describe } from "mocha";
import {
  buildGoBackHistoryForTransition,
  getGoBackHistoryForTransition,
  isBackTransition,
} from "../go-back-history.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
import { mockResponse } from "mock-req-res";
import type { AuthState } from "../state-machine.js";

describe("go-back-history", () => {
  describe("buildGoBackHistoryForTransition", () => {
    const testCases = [
      {
        currentGoBackHistory: [] as string[],
        passkeysEnabled: true,
        previousState: "/first-path",
        isReversibleTransition: true,
        expected: ["/first-path"],
      },
      {
        currentGoBackHistory: ["/first-path"],
        passkeysEnabled: true,
        previousState: "/second-path",
        isReversibleTransition: true,
        expected: ["/first-path", "/second-path"],
      },
      {
        currentGoBackHistory: ["/first-path"],
        passkeysEnabled: true,
        previousState: "/second-path",
        isReversibleTransition: false,
        expected: ["/first-path"],
      },
      {
        currentGoBackHistory: ["/first-path"],
        passkeysEnabled: false,
        previousState: "/second-path",
        isReversibleTransition: true,
        expected: ["/first-path"],
      },
      {
        currentGoBackHistory: ["/first-path"],
        passkeysEnabled: false,
        previousState: "/second-path",
        isReversibleTransition: false,
        expected: ["/first-path"],
      },
    ];

    testCases.forEach(
      ({
        currentGoBackHistory,
        passkeysEnabled,
        previousState,
        isReversibleTransition,
        expected,
      }) => {
        it(`should return ${expected} when currentGoBackHistory=${currentGoBackHistory}, passkeysEnabled=${passkeysEnabled}, previousState=${previousState}, isReversibleTransition=${isReversibleTransition} `, () => {
          expect(
            buildGoBackHistoryForTransition(
              currentGoBackHistory,
              passkeysEnabled,
              previousState,
              isReversibleTransition
            )
          ).to.deep.equal(expected);
        });
      }
    );
  });

  describe("getGoBackHistoryForTransition", () => {
    function createNextState(
      transitions: { meta?: { reversible?: boolean } }[]
    ): AuthState {
      return { transitions: transitions } as unknown as AuthState;
    }

    it("should append currentState when passkeys enabled and all transitions are reversible", () => {
      const req = createMockRequest("/enter-password");
      req.session.user = {
        journey: {
          nextPath: "/enter-email",
          optionalPaths: [],
          goBackHistory: [],
        },
      };
      const res = mockResponse({ locals: { supportPasskeyUsage: true } });

      const result = getGoBackHistoryForTransition(
        req,
        res,
        "/enter-email",
        createNextState([{ meta: { reversible: true } }])
      );

      expect(result).to.deep.equal(["/enter-email"]);
    });

    it("should not append when passkeys disabled even if transition is reversible", () => {
      const req = createMockRequest("/enter-password");
      req.session.user = {
        journey: {
          nextPath: "/enter-email",
          optionalPaths: [],
          goBackHistory: [],
        },
      };
      const res = mockResponse({ locals: {} });

      const result = getGoBackHistoryForTransition(
        req,
        res,
        "/enter-email",
        createNextState([{ meta: { reversible: true } }])
      );

      expect(result).to.deep.equal([]);
    });

    it("should not append when any transition in the array is not reversible", () => {
      const req = createMockRequest("/enter-password");
      req.session.user = {
        journey: {
          nextPath: "/enter-email",
          optionalPaths: [],
          goBackHistory: [],
        },
      };
      const res = mockResponse({
        locals: { supportPasskeyRegistration: true },
      });

      const result = getGoBackHistoryForTransition(
        req,
        res,
        "/enter-email",
        createNextState([
          { meta: { reversible: true } },
          { meta: { reversible: false } },
        ])
      );

      expect(result).to.deep.equal([]);
    });

    it("should not append when transitions have no meta at all", () => {
      const req = createMockRequest("/enter-password");
      req.session.user = {
        journey: {
          nextPath: "/enter-email",
          optionalPaths: [],
          goBackHistory: [],
        },
      };
      const res = mockResponse({ locals: { supportPasskeyUsage: true } });

      const result = getGoBackHistoryForTransition(
        req,
        res,
        "/enter-email",
        createNextState([{}])
      );

      expect(result).to.deep.equal([]);
    });

    it("should preserve existing goBackHistory and append currentState", () => {
      const req = createMockRequest("/enter-password");
      req.session.user = {
        journey: {
          nextPath: "/enter-email",
          optionalPaths: [],
          goBackHistory: ["/sign-in-or-create"],
        },
      };
      const res = mockResponse({ locals: { supportPasskeyUsage: true } });

      const result = getGoBackHistoryForTransition(
        req,
        res,
        "/enter-email",
        createNextState([{ meta: { reversible: true } }])
      );

      expect(result).to.deep.equal(["/sign-in-or-create", "/enter-email"]);
    });

    it("should treat supportPasskeyRegistration as passkeys enabled", () => {
      const req = createMockRequest("/enter-password");
      req.session.user = {
        journey: {
          nextPath: "/enter-email",
          optionalPaths: [],
          goBackHistory: [],
        },
      };
      const res = mockResponse({
        locals: {
          supportPasskeyRegistration: true,
          supportPasskeyUsage: false,
        },
      });

      const result = getGoBackHistoryForTransition(
        req,
        res,
        "/enter-email",
        createNextState([{ meta: { reversible: true } }])
      );

      expect(result).to.deep.equal(["/enter-email"]);
    });

    it("should treat supportPasskeyUsage as passkeys enabled", () => {
      const req = createMockRequest("/enter-password");
      req.session.user = {
        journey: {
          nextPath: "/enter-email",
          optionalPaths: [],
          goBackHistory: [],
        },
      };
      const res = mockResponse({
        locals: {
          supportPasskeyRegistration: false,
          supportPasskeyUsage: true,
        },
      });

      const result = getGoBackHistoryForTransition(
        req,
        res,
        "/enter-email",
        createNextState([{ meta: { reversible: true } }])
      );

      expect(result).to.deep.equal(["/enter-email"]);
    });

    it("should not append when transitions array is empty", () => {
      const req = createMockRequest("/enter-password");
      req.session.user = {
        journey: {
          nextPath: "/enter-email",
          optionalPaths: [],
          goBackHistory: [],
        },
      };
      const res = mockResponse({ locals: { supportPasskeyUsage: true } });

      const result = getGoBackHistoryForTransition(
        req,
        res,
        "/enter-email",
        createNextState([])
      );

      expect(result).to.deep.equal([]);
    });
  });

  describe("isBackTransition", () => {
    const testCases = [
      {
        goBackHistory: ["/first-path"],
        currentPath: "/first-path",
        expectedValue: true,
      },
      {
        goBackHistory: ["/first-path", "/second-path"],
        currentPath: "/second-path",
        expectedValue: true,
      },
      {
        goBackHistory: ["/first-path"],
        currentPath: "/second-path",
        expectedValue: false,
      },
      {
        goBackHistory: ["/first-path", "/second-path"],
        currentPath: "/first-path",
        expectedValue: false,
      },
      {
        goBackHistory: [],
        currentPath: "/first-path",
        expectedValue: false,
      },
    ];

    testCases.forEach(({ goBackHistory, currentPath, expectedValue }) => {
      it(`should return ${expectedValue} when goBackHistory is [${goBackHistory}] and currentPath is ${currentPath}`, () => {
        expect(isBackTransition(goBackHistory, currentPath)).to.eq(
          expectedValue
        );
      });
    });
  });
});
