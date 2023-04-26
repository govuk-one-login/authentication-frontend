import axios from "axios";
import zendeskConfig, { ZendeskConfig } from "../config/zendesk";
import { CreateTicketPayload, ZendeskInterface } from "./types";

export class ZendeskService implements ZendeskInterface {
  private readonly username: string;
  private readonly apiToken: string;
  private readonly apiUrl: string;

  constructor(config: ZendeskConfig) {
    this.username = config.username;
    this.apiToken = config.token;
    this.apiUrl = config.remoteUri;
  }

  async createTicket(
    form: CreateTicketPayload,
    ticketIdentifier?: string
  ): Promise<void> {
    const instance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${this.username}/token:${this.apiToken}`).toString(
            "base64"
          ),
        "Content-Type": "application/json",
      },
    });

    await instance.post("/tickets.json", form).catch((error) => {
      throw new Error(
        error.response.status +
          " " +
          error.response.statusText +
          " - ticketIdentifier: " +
          ticketIdentifier
      );
    });
  }
}

const defaultZendeskClient = new ZendeskService(zendeskConfig);
export { defaultZendeskClient };
