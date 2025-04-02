import { getSmartAgentApiKey, getSmartAgentApiUrl, getSmartAgentWebformId, } from "../config";
const smartAgentConfig = {
    webformID: getSmartAgentWebformId(),
    apiKey: getSmartAgentApiKey(),
    apiUrl: getSmartAgentApiUrl(),
};
export default smartAgentConfig;
