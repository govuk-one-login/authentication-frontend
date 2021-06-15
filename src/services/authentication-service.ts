import { API_ENDPOINTS } from "../app.constants";
import { http } from "../utils/http";
import {User} from "./types/user";

export async function userExists(emailAddress: string): Promise<boolean> {
  const {data} = await http.client.post<User>(API_ENDPOINTS.USER_EXISTS, {
    "email": emailAddress
  });

  return data.doesUserExist;
}
