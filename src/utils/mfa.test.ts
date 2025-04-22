import { expect } from "../../test/utils/test-utils";
import { MfaMethod, MfaMethodPriorityIdentifier } from "../types";
import { MFA_METHOD_TYPE } from "../app.constants";
import { upsertDefaultSmsMfaMethod } from "./mfa";

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
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            redactedPhoneNumber: "123",
          },
        ] as MfaMethod[],
      },
      {
        title: "redactedPhoneNumber replaces existing SMS DEFAULT",
        initialMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            redactedPhoneNumber: "123",
          },
        ] as MfaMethod[],
        redactedPhoneNumber: "890",
        phoneNumber: undefined,
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            redactedPhoneNumber: "890",
          },
        ] as MfaMethod[],
      },
      {
        title:
          "redactedPhoneNumber does not reset phoneNumber with existing SMS DEFAULT",
        initialMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            redactedPhoneNumber: "123",
            phoneNumber: "98534567123",
          },
        ] as MfaMethod[],
        redactedPhoneNumber: "890",
        phoneNumber: undefined,
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
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
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            phoneNumber: "123",
          },
        ] as MfaMethod[],
      },
      {
        title: "phoneNumber replaces existing SMS DEFAULT",
        initialMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            phoneNumber: "123",
          },
        ] as MfaMethod[],
        redactedPhoneNumber: undefined,
        phoneNumber: "890",
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            phoneNumber: "890",
          },
        ] as MfaMethod[],
      },
      {
        title:
          "phoneNumber does not reset redactedPhoneNumber with existing SMS DEFAULT",
        initialMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            redactedPhoneNumber: "123",
            phoneNumber: "98534567123",
          },
        ] as MfaMethod[],
        redactedPhoneNumber: undefined,
        phoneNumber: "123456789",
        expectedMfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
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
});
