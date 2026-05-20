import { type SessionData, Store } from "express-session";
import { logger } from "../utils/logger.js";
import { isDeepStrictEqual } from "node:util";

export class DualStoreError extends Error {
  constructor(
    public readonly primary: Error,
    public readonly secondary: Error
  ) {
    super("Both session stores failed");
  }
}

export class DualSessionStore extends Store {
  constructor(
    private readonly primary: Store,
    private readonly secondary: Store,
    private readonly primaryLabel: string,
    private readonly secondaryLabel: string
  ) {
    super();
  }

  get(
    sid: string,
    cb: (err?: any, session?: SessionData | null) => void
  ): void {
    this.primary.get(sid, (primaryErr, primarySession) => {
      if (primaryErr) {
        logger.warn(
          { err: primaryErr, sid, store: this.primaryLabel },
          "Primary session read failed, falling back to secondary"
        );
      } else {
        logger.info(
          { sid, store: this.primaryLabel },
          "Session read from primary"
        );
        cb(null, primarySession);
      }

      this.secondary.get(sid, (secondaryErr, secondarySession) => {
        if (primaryErr) {
          if (secondaryErr) {
            logger.warn(
              { err: secondaryErr, sid, store: this.secondaryLabel },
              "Secondary session read failed"
            );
          }
          const error = secondaryErr
            ? new DualStoreError(primaryErr, secondaryErr)
            : null;
          cb(error, secondarySession);
          return;
        }

        if (secondaryErr) {
          logger.warn(
            { err: secondaryErr, sid, store: this.secondaryLabel },
            "Secondary consistency check read failed"
          );
          return;
        }

        logger.info(
          { sid, store: this.secondaryLabel },
          "Session read from secondary"
        );
        this.performConsistencyChecks(primarySession, secondarySession, sid);
      });
    });
  }

  set(sid: string, sess: SessionData, cb: (err?: any) => void): void {
    this.primary.set(sid, sess, (err) => {
      logger.info(
        { sid, store: this.primaryLabel },
        "Session written to primary"
      );
      cb(err);
    });

    this.writeToSecondary("set", sid, sess);
  }

  destroy(sid: string, cb: (err?: any) => void): void {
    this.primary.destroy(sid, (err) => {
      logger.info(
        { sid, store: this.primaryLabel },
        "Session destroyed in primary"
      );
      cb(err);
    });

    this.secondary.destroy(sid, (secondaryErr) => {
      if (secondaryErr) {
        logger.warn(
          { err: secondaryErr, sid, store: this.secondaryLabel },
          "Secondary session destroy failed"
        );
        return;
      }
      logger.info(
        { sid, store: this.secondaryLabel },
        "Session destroyed in secondary"
      );
    });
  }

  touch(sid: string, sess: SessionData, cb: () => void): void {
    this.primary.touch(sid, sess, () => {
      logger.info(
        { sid, store: this.primaryLabel },
        "Session touched in primary"
      );
      cb();
    });

    this.writeToSecondary("touch", sid, sess);
  }

  private writeToSecondary(
    operation: "set" | "touch",
    sid: string,
    sess: SessionData
  ): void {
    try {
      this.secondary[operation](sid, sess, (secondaryErr) => {
        if (secondaryErr) {
          logger.warn(
            { err: secondaryErr, sid, operation, store: this.secondaryLabel },
            "Secondary session write failed"
          );
          return;
        }
        logger.info(
          { sid, operation, store: this.secondaryLabel },
          "Session written to secondary"
        );
      });
    } catch (err) {
      logger.warn(
        { err, sid, operation, store: this.secondaryLabel },
        "Secondary session write threw unexpectedly"
      );
    }
  }

  private performConsistencyChecks(
    primarySession: SessionData,
    secondarySession: SessionData,
    sid: string
  ): void {
    try {
      if (
        !isDeepStrictEqual(primarySession ?? null, secondarySession ?? null)
      ) {
        logger.warn(
          {
            sid,
            primaryExists: !!primarySession,
            secondaryExists: !!secondarySession,
          },
          "Session consistency mismatch"
        );
      }
    } catch (err) {
      logger.warn({ err }, "Error performing session store consistency checks");
    }
  }
}
