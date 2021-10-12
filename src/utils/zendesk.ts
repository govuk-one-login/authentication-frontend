import zendesk from "node-zendesk";
import { getZendeskAPIUrl, getZendeskToken, getZendeskUser } from "../config";

const zendeskAPIClient = zendesk.createClient({
  username: getZendeskUser(),
  token: getZendeskToken(),
  remoteUri: getZendeskAPIUrl(),
});

export { zendeskAPIClient };
