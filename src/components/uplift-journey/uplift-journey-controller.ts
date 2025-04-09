import type { ExpressRouteFunc } from "../../types.js";
import type { MfaServiceInterface } from "../common/mfa/types.js";
import { mfaService } from "../common/mfa/mfa-service.js";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller.js";
export function upliftJourneyGet(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return sendMfaGeneric(service);
}
