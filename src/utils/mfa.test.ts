import { expect } from "../../test/utils/test-utils.js";
import type { MfaMethod } from "../types.js";
import { MfaMethodPriority } from "../types.js";
import { MFA_METHOD_TYPE } from "../app.constants.js";
import {
  getDefaultSmsMfaMethod,
  removeDefaultSmsMfaMethod,
  upsertDefaultSmsMfaMethod,
} from "./mfa.js";

describe("mfa", () => {
  describe("upsertDefaultSmsMfaMethod", () => {
    [
      {
        title: "redactedPhoneNumber added correctly to empty array",
        initialMfaMethods: [] as MfaMethod[],
        redactedPhoneNumber: "123",
        phoneNumber: undefined,
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "123",
          },
        ] as MfaMethod[],
      },
      {
        title: "redactedPhoneNumber replaces existing SMS DEFAULT",
        initialMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "123",
          },
        ] as MfaMethod[],
        redactedPhoneNumber: "890",
        phoneNumber: undefined,
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "890",
          },
        ] as MfaMethod[],
      },
      {
        title: "redactedPhoneNumber does not reset phoneNumber with existing SMS DEFAULT",
        initialMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "123",
            phoneNumber: "98534567123",
          },
        ] as MfaMethod[],
        redactedPhoneNumber: "890",
        phoneNumber: undefined,
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "890",
            phoneNumber: "98534567123",
          },
        ] as MfaMethod[],
      },
      {
        title: "phoneNumber added correctly to empty array",
        initialMfaMethods: [] as MfaMethod[],
        redactedPhoneNumber: undefined,
        phoneNumber: "123",
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            phoneNumber: "123",
          },
        ] as MfaMethod[],
      },
      {
        title: "phoneNumber replaces existing SMS DEFAULT",
        initialMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            phoneNumber: "123",
          },
        ] as MfaMethod[],
        redactedPhoneNumber: undefined,
        phoneNumber: "890",
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            phoneNumber: "890",
          },
        ] as MfaMethod[],
      },
      {
        title: "phoneNumber does not reset redactedPhoneNumber with existing SMS DEFAULT",
        initialMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "123",
            phoneNumber: "98534567123",
          },
        ] as MfaMethod[],
        redactedPhoneNumber: undefined,
        phoneNumber: "123456789",
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "123",
            phoneNumber: "123456789",
          },
        ] as MfaMethod[],
      },
    ].forEach(
      (test: {
        title: string;
        initialMfaMethods: MfaMethod[];
        redactedPhoneNumber: string | undefined;
        phoneNumber: string | undefined;
        expectedMfaMethods: MfaMethod[];
      }) => {
        it(test.title, async () => {
          expect(
            upsertDefaultSmsMfaMethod(test.initialMfaMethods, {
              redactedPhoneNumber: test.redactedPhoneNumber,
              phoneNumber: test.phoneNumber,
            })
          ).to.deep.eq(test.expectedMfaMethods);
        });
      }
    );
  });

  describe("getDefaultSmsMfaMethodDetail", () => {
    [
      {
        title: "returns undefined with empty array",
        mfaMethods: [] as MfaMethod[],
        expectedMfaMethod: undefined,
      },
      {
        title: "returns expected redactedPhoneNumber with SMS DEFAULT",
        mfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "123",
            phoneNumber: "089",
          },
        ] as MfaMethod[],
        expectedMfaMethod: {
          type: MFA_METHOD_TYPE.SMS,
          priority: MfaMethodPriority.DEFAULT,
          redactedPhoneNumber: "123",
          phoneNumber: "089",
        },
      },
    ].forEach(
      (test: {
        title: string;
        mfaMethods: MfaMethod[];
        expectedMfaMethod: MfaMethod;
      }) => {
        it(test.title, async () => {
          expect(getDefaultSmsMfaMethod(test.mfaMethods)).to.deep.eq(
            test.expectedMfaMethod
          );
        });
      }
    );
  });

  describe("removeDefaultSmsMfaMethod", () => {
    [
      {
        title: "returns empty array with one SMS DEFAULT",
        mfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priority: MfaMethodPriority.DEFAULT,
            redactedPhoneNumber: "123",
            phoneNumber: "089",
          },
        ] as MfaMethod[],
        expectedMfaMethods: [],
      },
    ].forEach(
      (test: {
        title: string;
        mfaMethods: MfaMethod[];
        expectedMfaMethods: MfaMethod[];
      }) => {
        it(test.title, async () => {
          expect(removeDefaultSmsMfaMethod(test.mfaMethods)).to.deep.eq(
            test.expectedMfaMethods
          );
        });
      }
    );
  });
});
