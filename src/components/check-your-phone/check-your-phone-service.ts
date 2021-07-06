import { getBaseRequestConfig, Http, http } from "../../utils/http";
import {
  API_ENDPOINTS,
  NOTIFICATION_TYPE,
  USER_STATE,
} from "../../app.constants";
import { VerifyCode } from "../verify-email/types";
import { CheckYourPhoneNumberService } from "./types";

export function checkYourPhoneService(
  axios: Http = http
): CheckYourPhoneNumberService {
  const verifyPhoneNumber = async function (
    sessionId: string,
    code: string
  ): Promise<boolean> {
    const { data } = await axios.client.post<VerifyCode>(
      API_ENDPOINTS.VERIFY_CODE,
      {
        code: code,
        notificationType: NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
      },
      getBaseRequestConfig(sessionId)
    );

    return (
      data.sessionState &&
      data.sessionState === USER_STATE.PHONE_NUMBER_VERIFIED
    );
  };

  return {
    verifyPhoneNumber,
  };
}
