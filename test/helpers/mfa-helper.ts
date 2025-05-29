import type { MfaMethod } from "../../src/types.js";
import { MfaMethodPriority } from "../../src/types.js";
import { MFA_METHOD_TYPE } from "../../src/app.constants.js";

export type PartialMfaMethod = {
  id?: string;
  phoneNumber?: string;
  redactedPhoneNumber?: string;
  authApp?: boolean;
};

export function buildMfaMethods(
  partialMfaMethods: PartialMfaMethod | PartialMfaMethod[]
): MfaMethod[] {
  return (Array.isArray(partialMfaMethods) ? partialMfaMethods : [partialMfaMethods]).map(
    (partial, index) => {
      const priority = index === 0 ? MfaMethodPriority.DEFAULT : MfaMethodPriority.BACKUP;

      const mfaMethodBuilder = {
        ...(partial.id ? { id: partial.id } : undefined),
        priority,
      };

      if (partial.redactedPhoneNumber || partial.phoneNumber) {
        return {
          ...mfaMethodBuilder,
          type: MFA_METHOD_TYPE.SMS,
          ...(partial.phoneNumber ? { phoneNumber: partial.phoneNumber } : undefined),
          ...(partial.redactedPhoneNumber
            ? { redactedPhoneNumber: partial.redactedPhoneNumber }
            : undefined),
        };
      } else if (partial.authApp) {
        return {
          ...mfaMethodBuilder,
          type: MFA_METHOD_TYPE.AUTH_APP,
        };
      } else return undefined;
    }
  );
}
