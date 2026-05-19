import { afterEach, beforeEach, describe, it } from "mocha";
import { expect, sinon } from "../utils/test-utils.js";
import {
  DualSessionStore,
  DualStoreError,
} from "../../src/config/dual-session-store.js";
import { type SessionData, Store } from "express-session";

describe("DualSessionStore", () => {
  let primary: Store;
  let secondary: Store;
  let store: DualSessionStore;
  const sid = "test-session-id";
  const session = { cookie: { originalMaxAge: 3600000 } } as SessionData;

  beforeEach(() => {
    primary = Object.create(Store.prototype);
    secondary = Object.create(Store.prototype);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("get", () => {
    it("should return session from primary", (done) => {
      primary.get = sinon.fake((_sid, cb) => cb(null, session));
      secondary.get = sinon.fake((_sid, cb) => cb(null, session));
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        done();
      });
    });

    it("should fallback to secondary when primary fails", (done) => {
      const secondarySession = {
        cookie: { originalMaxAge: 9999 },
      } as SessionData;
      primary.get = sinon.fake((_sid, cb) => cb(new Error("primary failure")));
      secondary.get = sinon.fake((_sid, cb) => cb(null, secondarySession));
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(secondarySession);
        done();
      });
    });

    it("should return combined error when both primary and secondary fail", (done) => {
      const primaryErr = new Error("primary failure");
      const secondaryErr = new Error("secondary failure");
      primary.get = sinon.fake((_sid, cb) => cb(primaryErr));
      secondary.get = sinon.fake((_sid, cb) => cb(secondaryErr));
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err) => {
        expect(err).to.be.instanceOf(DualStoreError);
        expect(err.message).to.equal("Both session stores failed");
        expect(err.primary).to.equal(primaryErr);
        expect(err.secondary).to.equal(secondaryErr);
        done();
      });
    });

    it("should perform secondary consistency check read", (done) => {
      primary.get = sinon.fake((_sid, cb) => cb(null, session));
      secondary.get = sinon.fake((_sid, cb) => {
        cb(null, session);
        done();
      });
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, () => {});
    });

    it("should not throw when secondary consistency check fails", (done) => {
      primary.get = sinon.fake((_sid, cb) => cb(null, session));
      secondary.get = sinon.fake((_sid, cb) =>
        cb(new Error("secondary failure"))
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });
  });

  describe("set", () => {
    it("should write to primary and call back", (done) => {
      primary.set = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null)
      );
      secondary.set = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null)
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.set(sid, session, (err) => {
        expect(err).to.be.undefined;
        expect(primary.set).to.have.been.calledOnce;
        expect(secondary.set).to.have.been.calledOnce;
        done();
      });
    });

    it("should return primary error to callback and still write to secondary", (done) => {
      const error = new Error("primary write failure");
      primary.set = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(error)
      );
      secondary.set = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null)
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.set(sid, session, (err) => {
        expect(err).to.equal(error);
        expect(secondary.set).to.have.been.calledOnce;
        done();
      });
    });

    it("should not throw when secondary write fails", (done) => {
      primary.set = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null)
      );
      secondary.set = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) =>
          cb(new Error("secondary failure"))
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.set(sid, session, (err) => {
        expect(err).to.be.undefined;
        done();
      });
    });

    it("should return DualStoreError when both stores fail", (done) => {
      const primaryErr = new Error("primary write failure");
      const secondaryErr = new Error("secondary write failure");
      primary.set = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) =>
          cb(primaryErr)
      );
      secondary.set = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) =>
          cb(secondaryErr)
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.set(sid, session, (err) => {
        expect(err).to.be.instanceOf(DualStoreError);
        expect(err.primary).to.equal(primaryErr);
        expect(err.secondary).to.equal(secondaryErr);
        done();
      });
    });
  });

  describe("destroy", () => {
    it("should destroy in both stores and call back", (done) => {
      primary.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(null)
      );
      secondary.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(null)
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.destroy(sid, (err) => {
        expect(err).to.be.undefined;
        expect(primary.destroy).to.have.been.calledOnce;
        expect(secondary.destroy).to.have.been.calledOnce;
        done();
      });
    });

    it("should return primary error and still destroy in secondary", (done) => {
      const error = new Error("primary destroy failure");
      primary.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(error)
      );
      secondary.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(null)
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.destroy(sid, (err) => {
        expect(err).to.equal(error);
        expect(secondary.destroy).to.have.been.calledOnce;
        done();
      });
    });

    it("should not throw when secondary destroy fails", (done) => {
      primary.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(null)
      );
      secondary.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(new Error("secondary failure"))
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.destroy(sid, (err) => {
        expect(err).to.be.undefined;
        done();
      });
    });

    it("should return DualStoreError when both stores fail", (done) => {
      const primaryErr = new Error("primary destroy failure");
      const secondaryErr = new Error("secondary destroy failure");
      primary.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(primaryErr)
      );
      secondary.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(secondaryErr)
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.destroy(sid, (err) => {
        expect(err).to.be.instanceOf(DualStoreError);
        expect(err.primary).to.equal(primaryErr);
        expect(err.secondary).to.equal(secondaryErr);
        done();
      });
    });
  });

  describe("touch", () => {
    it("should touch in both stores and call back", (done) => {
      primary.touch = sinon.fake(
        (_sid: string, _sess: SessionData, cb: () => void) => cb()
      );
      secondary.touch = sinon.fake(
        (_sid: string, _sess: SessionData, cb: () => void) => cb()
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.touch(sid, session, () => {
        expect(primary.touch).to.have.been.calledOnce;
        expect(secondary.touch).to.have.been.calledOnce;
        done();
      });
    });

    it("should not throw when secondary touch fails", (done) => {
      primary.touch = sinon.fake(
        (_sid: string, _sess: SessionData, cb: () => void) => cb()
      );
      secondary.touch = sinon.fake(
        (_sid: string, _sess: SessionData, cb: (err?: any) => void) =>
          cb(new Error("secondary failure"))
      );
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.touch(sid, session, () => {
        done();
      });
    });
  });

  describe("consistency checks", () => {
    it("should not error when sessions match", (done) => {
      primary.get = sinon.fake((_sid, cb) => cb(null, session));
      secondary.get = sinon.fake((_sid, cb) => cb(null, session));
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });

    it("should not throw when sessions differ", (done) => {
      const differentSession = {
        cookie: { originalMaxAge: 9999 },
      } as SessionData;
      primary.get = sinon.fake((_sid, cb) => cb(null, session));
      secondary.get = sinon.fake((_sid, cb) => cb(null, differentSession));
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });

    it("should not throw when primary has session but secondary does not", (done) => {
      primary.get = sinon.fake((_sid, cb) => cb(null, session));
      secondary.get = sinon.fake((_sid, cb) => cb(null, null));
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });

    it("should not throw when both stores return null", (done) => {
      primary.get = sinon.fake((_sid, cb) => cb(null, null));
      secondary.get = sinon.fake((_sid, cb) => cb(null, null));
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.be.null;
        setTimeout(done, 10);
      });
    });

    it("should catch exceptions thrown during consistency checks", (done) => {
      const badSession = {
        get cookie() {
          throw new Error("unexpected error");
        },
      } as unknown as SessionData;
      primary.get = sinon.fake((_sid, cb) => cb(null, session));
      secondary.get = sinon.fake((_sid, cb) => cb(null, badSession));
      store = new DualSessionStore(primary, secondary, "Redis", "DynamoDB");

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });
  });
});
