import axios from "axios";
import smartAgentConfig, { SmartAgentConfig } from "../config/smartAgent";
import { SmartAgentTicket } from "../components/contact-us/types";

export class SmartAgentService {
  private readonly webformID: string;
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(config: SmartAgentConfig) {
    this.webformID = config.webformID;
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
  }

  async createTicket(payload: SmartAgentTicket): Promise<void> {
    await axios
      .post(
        this.apiUrl,
        {
          webformID: this.webformID,
          message: payload.message,
          email: payload.email || "Email not provided",
          customAttributes: payload.customAttributes,
        },
        {
          headers: {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      )
      .catch((error) => {
        throw new Error(
          error.response.status + " " + error.response.statusText
        );
      });
  }
}

const defaultSmartAgentClient = new SmartAgentService(smartAgentConfig);
export { defaultSmartAgentClient };
