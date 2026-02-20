import crypto from "node:crypto";
import type { Response } from "express";
import { getGoogleAnalyticsAndDynatraceCookieDomain } from "../config.js";

export function setAmcCookie(redirectUrl: string, res: Response): void {
  const url = new URL(redirectUrl);
  const jwt = url.searchParams.get("request");

  if (jwt) {
    const hash = crypto.createHash("sha256").update(jwt).digest("hex");
    res.cookie("amc", hash, {
      secure: true,
      httpOnly: true,
      domain: getGoogleAnalyticsAndDynatraceCookieDomain(),
    });
  }
}
