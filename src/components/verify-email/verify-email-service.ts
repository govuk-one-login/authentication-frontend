import { getBaseRequestConfig, Http, http } from "../../utils/http";
import {
  API_ENDPOINTS,
  NOTIFICATION_TYPE,
  USER_STATE,
} from "../../app.constants";
import { VerifyCode, VerifyEmailServiceInterface } from "./types";

export function verifyEmailService(
  axios: Http = http
): VerifyEmailServiceInterface {
  const verifyEmailCode = async function (
    sessionId: string,
    code: string
  ): Promise<boolean> {
    const { data } = await axios.client.post<VerifyCode>(
      API_ENDPOINTS.VERIFY_CODE,
      {
        code: code,
        notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
      },
      getBaseRequestConfig(sessionId)
    );

    return (
      data.sessionState && data.sessionState === USER_STATE.EMAIL_CODE_VERIFIED
    );
  };
  return {
    verifyEmailCode,
  };
}
