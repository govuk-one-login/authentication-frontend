import * as cheerio from "cheerio";
import type { Response } from "supertest";

export function extractCsrfTokenAndCookies(res: Response): {
  token: string | undefined;
  cookies: string;
} {
  const $ = cheerio.load(res.text);
  const tokenValue = $("[name=_csrf]").val();
  return {
    token: Array.isArray(tokenValue) ? tokenValue[0] : tokenValue,
    cookies: res.headers["set-cookie"],
  };
}
