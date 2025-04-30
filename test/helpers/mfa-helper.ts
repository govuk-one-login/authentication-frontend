import type { MfaMethod } from "../../src/types.js";
import { MfaMethodPriority } from "../../src/types.js";
import { MFA_METHOD_TYPE } from "../../src/app.constants.js";

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
        priority: MfaMethodPriority.DEFAULT,
        phoneNumber,
        redactedPhoneNumber,
      },
    ];
  }
  return [];
}
