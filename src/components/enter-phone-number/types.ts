import { ApiResponseResult } from "../../types";

export interface EnterPhoneNumberServiceInterface {
  sendPhoneVerificationNotification: (
    sessionId: string,
    email: string,
    phoneNumber: string
  ) => Promise<ApiResponseResult>;
  updateProfile: (
    sessionId: string,
    email: string,
    phoneNumber: string
  ) => Promise<boolean>;
}

export interface UpdateUserProfile {
  sessionState: string;
}
