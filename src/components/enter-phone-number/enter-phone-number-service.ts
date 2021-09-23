import { getBaseRequestConfig, Http, http } from "../../utils/http";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  NOTIFICATION_TYPE,
  USER_STATE,
} from "../../app.constants";
import { EnterPhoneNumberServiceInterface, UpdateUserProfile } from "./types";
import { ApiResponse, ApiResponseResult } from "../../types";

const UPDATE_TYPE_ADD_PHONE_NUMBER = "ADD_PHONE_NUMBER";

export function enterPhoneNumberService(
  axios: Http = http
): EnterPhoneNumberServiceInterface {
  const updateProfile = async function (
    sessionId: string,
    email: string,
    phoneNumber: string
  ): Promise<boolean> {
    const { data } = await axios.client.post<UpdateUserProfile>(
      API_ENDPOINTS.UPDATE_PROFILE,
      {
        email,
        profileInformation: phoneNumber,
        updateProfileType: UPDATE_TYPE_ADD_PHONE_NUMBER,
      },
      getBaseRequestConfig(sessionId)
    );

    return data.sessionState === USER_STATE.ADDED_UNVERIFIED_PHONE_NUMBER;
  };

  const sendPhoneNumberVerificationNotification = async function (
    sessionId: string,
    email: string,
    phoneNumber: string
  ): Promise<ApiResponseResult> {
    const config = getBaseRequestConfig(sessionId);
    config.validateStatus = function (status: number) {
      return (
        status === HTTP_STATUS_CODES.OK ||
        status === HTTP_STATUS_CODES.BAD_REQUEST
      );
    };

    const { data, status } = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.SEND_NOTIFICATION,
      {
        email,
        phoneNumber,
        notificationType: NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
      },
      config
    );

    return {
      success: status === HTTP_STATUS_CODES.OK,
      code: data.code,
      message: data.message,
    };
  };

  return {
    updateProfile,
    sendPhoneVerificationNotification: sendPhoneNumberVerificationNotification,
  };
}
