import axios from "axios";
import type { SmartAgentConfig } from "../config/smartAgent.js";
import smartAgentConfig from "../config/smartAgent.js";
import type { SmartAgentTicket } from "../components/contact-us/types.js";
import { logger } from "./logger.js";

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
        logger.info(`Error posting to SmartAgent API`);
        logger.info(`webformID is ${this.webformID}`);
        logger.info(`apiKey is ${this.apiKey}`);
        logger.info(`apiUrl is ${this.apiUrl}`);

        logger.error(error.toJSON());
        throw new Error(
          `Failed contact form submission to SmartAgent: ${error?.response?.status} ${error?.response?.statusText}. Ticket identifier: ${payload.customAttributes?.["sa-ticket-id"]}`
        );
      });
  }
}

const defaultSmartAgentClient = new SmartAgentService(smartAgentConfig);
export { defaultSmartAgentClient };
