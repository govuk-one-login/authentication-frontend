import type { MfaMethod } from "../../src/types.js";
import { MfaMethodPriority } from "../../src/types.js";
import { MFA_METHOD_TYPE } from "../../src/app.constants.js";

type PartialMfaMethod = {
  id?: string;
  type: MFA_METHOD_TYPE;
  phoneNumber?: string;
  redactedPhoneNumber?: string;
};

export function buildMfaMethods(
  partialMfaMethods: PartialMfaMethod | PartialMfaMethod[]
): MfaMethod[] {
  return (
    Array.isArray(partialMfaMethods) ? partialMfaMethods : [partialMfaMethods]
  ).map((partial, index) => {
    const priority =
      index === 0 ? MfaMethodPriority.DEFAULT : MfaMethodPriority.BACKUP;

    if (partial.redactedPhoneNumber || partial.phoneNumber) {
      return {
        ...(partial.id ? { id: partial.id } : undefined),
        type: MFA_METHOD_TYPE.SMS,
        priority,
        ...(partial.phoneNumber
          ? { phoneNumber: partial.phoneNumber }
          : undefined),
        ...(partial.redactedPhoneNumber
          ? { redactedPhoneNumber: partial.redactedPhoneNumber }
          : undefined),
      };
    } else if (partial.type === MFA_METHOD_TYPE.AUTH_APP) {
      return {
        ...(partial.id ? { id: partial.id } : undefined),
        type: MFA_METHOD_TYPE.AUTH_APP,
        priority: priority,
      };
    } else return undefined;
  });
}
