import { getRequestConfig, Http, http } from "../../utils/http";
import { API_ENDPOINTS, USER_STATE } from "../../app.constants";

import {
  ClientInfoResponse,
  UpdateTermsAndCondsServiceInterface,
  UpdateUserProfile,
} from "./types";

const UPDATE_TERMS_AND_CONDS = "UPDATE_TERMS_CONDS";

export function updateTermsAndCondsService(
  axios: Http = http
): UpdateTermsAndCondsServiceInterface {
  const updateProfile = async function (
    sessionId: string,
    email: string,
    updatedTermsAndCondsValue: boolean,
    sourceIp: string
  ): Promise<boolean> {
    const { data } = await axios.client.post<UpdateUserProfile>(
      API_ENDPOINTS.UPDATE_PROFILE,
      {
        email,
        profileInformation: updatedTermsAndCondsValue,
        updateProfileType: UPDATE_TERMS_AND_CONDS,
      },
      getRequestConfig({ sessionId: sessionId, sourceIp: sourceIp })
    );

    return data.sessionState === USER_STATE.UPDATED_TERMS_AND_CONDITIONS;
  };

  const clientInfo = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string
  ): Promise<ClientInfoResponse> {
    const { data } = await axios.client.get<ClientInfoResponse>(
      API_ENDPOINTS.CLIENT_INFO,
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        sourceIp: sourceIp
      })
    );

    return data;
  };

  return {
    updateProfile,
    clientInfo,
  };
}
