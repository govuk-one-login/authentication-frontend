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
        } else {
          logger.info(
            { sid, store: this.secondaryLabel },
            "Session read from secondary"
          );
          this.performConsistencyChecks(primarySession, secondarySession, sid);
        }

        cb(null, primarySession);
      });
    });
  }

  set(sid: string, sess: SessionData, cb: (err?: any) => void): void {
    this.primary.set(sid, sess, (primaryErr) => {
      if (primaryErr) {
        logger.warn(
          { err: primaryErr, sid, store: this.primaryLabel },
          "Primary session write failed"
        );
      } else {
        logger.info(
          { sid, store: this.primaryLabel },
          "Session written to primary"
        );
      }

      this.secondary.set(sid, sess, (secondaryErr) => {
        if (secondaryErr) {
          logger.warn(
            { err: secondaryErr, sid, store: this.secondaryLabel },
            "Secondary session write failed"
          );
        } else {
          logger.info(
            { sid, store: this.secondaryLabel },
            "Session written to secondary"
          );
        }

        if (primaryErr && secondaryErr) {
          cb(new DualStoreError(primaryErr, secondaryErr));
        } else if (primaryErr) {
          cb(primaryErr);
        } else {
          cb();
        }
      });
    });
  }

  destroy(sid: string, cb: (err?: any) => void): void {
    this.primary.destroy(sid, (primaryErr) => {
      if (primaryErr) {
        logger.warn(
          { err: primaryErr, sid, store: this.primaryLabel },
          "Primary session destroy failed"
        );
      } else {
        logger.info(
          { sid, store: this.primaryLabel },
          "Session destroyed in primary"
        );
      }

      this.secondary.destroy(sid, (secondaryErr) => {
        if (secondaryErr) {
          logger.warn(
            { err: secondaryErr, sid, store: this.secondaryLabel },
            "Secondary session destroy failed"
          );
        } else {
          logger.info(
            { sid, store: this.secondaryLabel },
            "Session destroyed in secondary"
          );
        }

        if (primaryErr && secondaryErr) {
          cb(new DualStoreError(primaryErr, secondaryErr));
        } else if (primaryErr) {
          cb(primaryErr);
        } else {
          cb();
        }
      });
    });
  }

  touch(sid: string, sess: SessionData, cb: () => void): void {
    this.primary.touch(sid, sess, () => {
      logger.info(
        { sid, store: this.primaryLabel },
        "Session touched in primary"
      );

      this.touchSecondary(sid, sess, cb);
    });
  }

  private touchSecondary(sid: string, sess: SessionData, cb: () => void): void {
    try {
      if (this.secondary.touch) {
        this.secondary.touch(sid, sess, () => {
          logger.info(
            { sid, store: this.secondaryLabel },
            "Session touched in secondary"
          );
          cb();
        });
      } else {
        cb();
      }
    } catch (err) {
      logger.warn(
        { err, sid, store: this.secondaryLabel },
        "Secondary session touch threw unexpectedly"
      );
      cb();
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
