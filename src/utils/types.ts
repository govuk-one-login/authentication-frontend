interface Comment {
  body?: string;
  html_body?: string;
  public?: boolean;
}

export interface CreateTicketPayload {
  ticket: CreateTicket;
}

export interface CreateTicket {
  comment: Comment;
  subject?: string;
  group_id?: number;
  tags?: ReadonlyArray<string> | null;
  requester?: RequesterAnonymous;
}

interface RequesterAnonymous {
  name?: string;
  email?: string;
}

export interface ZendeskInterface {
  createTicket(
    form: CreateTicketPayload,
    ticketIdentifier?: string
  ): Promise<void>;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  name?: string;
  uri?: string;
  tls?: boolean;
  isLocal: boolean;
}
