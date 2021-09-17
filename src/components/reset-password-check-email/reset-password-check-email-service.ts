import { getBaseRequestConfig, Http, http } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";

import {
  ResetPasswordRequestResponse,
  ResetPasswordCheckEmailServiceInterface,
} from "./types";

export function resetPasswordCheckEmailService(
  axios: Http = http
): ResetPasswordCheckEmailServiceInterface {
  const resetPasswordRequest = async function (
    email: string,
    sessionId: string
  ): Promise<ResetPasswordRequestResponse> {
    const { data } = await axios.client.post<ResetPasswordRequestResponse>(
      API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      {
        email: email,
      },
      getBaseRequestConfig(sessionId)
    );
    return data;
  };
  return {
    resetPasswordRequest,
  };
}
