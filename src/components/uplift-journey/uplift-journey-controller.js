import { mfaService } from "../common/mfa/mfa-service";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller";
export function upliftJourneyGet(service = mfaService()) {
    return sendMfaGeneric(service);
}
