import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export interface UpdateProfileServiceInterface {
  updateProfile: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    requestType: RequestType,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}

export interface RequestType {
  profileInformation: string | boolean;
  updateProfileType: string;
}
