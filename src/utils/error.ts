export class BadRequestError extends Error {
  private status: number;
  constructor(message: string, code: number) {
    super(`Bad Request:${code}:${message}`);
    this.status = 400;
  }
}
