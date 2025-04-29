import type { MfaMethod } from "../../src/types";
import { MfaMethodPriorityIdentifier } from "../../src/types";
import { MFA_METHOD_TYPE } from "../../src/app.constants";

export function buildMfaMethods({
  phoneNumber,
  redactedPhoneNumber,
}: {
  phoneNumber?: string;
  redactedPhoneNumber?: string;
}): MfaMethod[] {
  if (redactedPhoneNumber || phoneNumber) {
    return [
      {
        type: MFA_METHOD_TYPE.SMS,
        priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
        phoneNumber,
        redactedPhoneNumber,
      },
    ];
  }
  return [];
}
