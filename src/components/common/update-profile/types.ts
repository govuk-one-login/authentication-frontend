import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { Request } from "express";

export interface UpdateProfileServiceInterface {
  updateProfile: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    updateType: UpdateType,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}

export enum UpdateType {
  UPDATE_TERMS_CONDS = "UPDATE_TERMS_CONDS",
  SKIP_ADDING_PASSKEY = "SKIP_ADDING_PASSKEY",
}
