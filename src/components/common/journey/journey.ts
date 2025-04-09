import { JOURNEY_TYPE } from "../../../app.constants.js";
import { UserSession } from "../../../types.js";
type GetJourneyTypeFromUserSessionOptions = {
  fallbackJourneyType?: JOURNEY_TYPE;
  includeReauthentication?: true;
  includeAccountRecovery?: true;
};

/**
 * Uses the user session data to determine what type
 * of journey the user is actively engaged in.
 *
 * You must specify the types you want to receive with
 * the options.include* properties.
 *
 * Introduced so the MFA backend API can know the
 * user journey when we request or submit an MFA code.
 *
 * The logic to determine the journey exists here, but
 * this function only supports the REAUTENTICATION journey type
 * and ACCOUNT_RECOVERY at the moment. This could be extended
 * given time understanding the implications of doing so.
 * At that point we could look to always return the journey,
 * rather than optionally.
 */
function getJourneyTypeFromUserSession(
  userSession: UserSession,
  options: GetJourneyTypeFromUserSessionOptions = {}
): JOURNEY_TYPE | undefined {
  if (options.includeReauthentication && userSession.reauthenticate) {
    return JOURNEY_TYPE.REAUTHENTICATION;
  }

  if (
    options.includeAccountRecovery &&
    userSession.isAccountRecoveryPermitted &&
    userSession.isAccountRecoveryJourney
  ) {
    return JOURNEY_TYPE.ACCOUNT_RECOVERY;
  }

  // We should be able to know the user journey at all
  // times, without having the option of returning undefined
  // as the fallback. However, we need to be certain this
  // won't have adverse effects elsewhere in the frontend
  // or API codebase which is already anticipating undefined
  // values in most cases.
  return options.fallbackJourneyType;
}

export { getJourneyTypeFromUserSession, GetJourneyTypeFromUserSessionOptions };
