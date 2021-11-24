import { ApiResponseResult } from "../../../types";

export interface UpdateProfileServiceInterface {
  updateProfile: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    requestType: RequestType,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult>;
}

export interface RequestType {
  profileInformation: string | boolean;
  updateProfileType: string;
}
