import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { Request } from "express";

export interface UpdateProfileServiceInterface {
  updateProfile: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    requestType: RequestType,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}

export interface RequestType {
  profileInformation: string | boolean;
  updateProfileType: UpdateType;
}

export enum UpdateType {
  UPDATE_TERMS_CONDS = "UPDATE_TERMS_CONDS",
  SKIP_ADDING_PASSKEY = "SKIP_ADDING_PASSKEY",
}
