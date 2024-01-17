import { JOURNEY_TYPE } from "../../../app.constants";
import { UserSession } from "../../../types";

/**
 * Uses the user session data to determine what type
 * of journey the user is actively engaged in.
 *
 * Introduced so the MFA backend API can know the
 * user journey when requests for a new code are received.
 *
 * Only supports the REAUTENTICATION journey type
 * at the moment, and this could be extended given
 * time understanding the implications of doing so.
 */
function getJourneyTypeFromUserSession(
  userSession: UserSession
): JOURNEY_TYPE | undefined {
  if (userSession.reauthenticate) {
    return JOURNEY_TYPE.REAUTHENTICATION;
  }

  return undefined;
}

export { getJourneyTypeFromUserSession };
