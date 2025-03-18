import { DefaultApiResponse } from "../../types.js";

export interface IPVAuthorisationResponse extends DefaultApiResponse {
  redirectUri?: string;
}
