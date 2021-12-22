import { getZendeskAPIUrl, getZendeskToken, getZendeskUser } from "../config";

export interface ZendeskConfig {
  username: string;
  token: string;
  remoteUri: string;
}

const zendeskConfig: ZendeskConfig = {
  username: getZendeskUser(),
  remoteUri: getZendeskAPIUrl(),
  token: getZendeskToken(),
};

export default zendeskConfig;
