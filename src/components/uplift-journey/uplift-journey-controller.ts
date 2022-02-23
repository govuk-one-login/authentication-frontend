import { ExpressRouteFunc } from "../../types";

import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller";

export function upliftJourneyGet(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return sendMfaGeneric(service);
}
