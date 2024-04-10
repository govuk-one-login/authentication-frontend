import chai from "chai";
import chaiHttp from "chai-http";
import { describe } from "mocha";

const expect = chai.expect;

chai.use(chaiHttp);

import {
  GenericContainer,
  StartedTestContainer,
  Network,
  StartedNetwork,
  Wait,
  getContainerRuntimeClient,
} from "testcontainers";
import { Environment } from "testcontainers/build/types";
import path from "path";

describe("BasicAuthSidecar", function () {
  let network: StartedNetwork;

  let sourceIp: string;

  // let backendContainer: StartedTestContainer;
  let sidecarContainer: StartedTestContainer;

  let sidecarImage: GenericContainer;
  let sidecarRequester: ChaiHttp.Agent;

  const backendConfig = {
    PORT: 8080,
    ALIAS: "backend",
  };

  before(async function () {
    this.timeout(60000);
    network = await new Network().start();

    const backendContainer = await new GenericContainer(
      "mendhak/http-https-echo:31"
    )
      .withNetwork(network)
      .withNetworkAliases(backendConfig.ALIAS)
      .withEnvironment({ HTTP_PORT: backendConfig.PORT.toString() })
      .withExposedPorts(8080)
      .withWaitStrategy(
        Wait.forAll([
          Wait.forHttp("/", backendConfig.PORT),
          Wait.forLogMessage(
            `Listening on ports ${backendConfig.PORT} for http`
          ),
        ])
      )
      .start();

    if (process.platform === "darwin") {
      // on mac the source IP is probably different. Lets pull it from host.docker.internal
      // in the backend container

      // eslint-disable-next-line no-console
      console.error(
        "!! Detected MacOS, source IP detection may not work. Ensure you are using the latest Docker Desktop if you get errors."
      );

      await backendContainer
        .exec(["getent", "hosts", "gateway.docker.internal"])
        .then((res) => {
          const ip = res.output.toString().split(" ")[0].replace("\n", "");
          // replace last octet with 1
          sourceIp = ip.substring(0, ip.lastIndexOf(".")) + ".1";
        });
    } else {
      // get network gateway IP
      await getContainerRuntimeClient()
        .then(async (client) => {
          const net = client.network.getById(network.getId());
          await net.inspect().then((res) => {
            sourceIp = res.IPAM.Config[0].Gateway;
          });
        })
        .catch((err) => {
          throw err;
        });
    }

    sidecarImage = await GenericContainer.fromDockerfile(
      path.join(path.dirname(__filename), "../../basic-auth-sidecar")
    ).build("basic-auth-sidecar-test", { deleteOnExit: false });
  });

  async function startSidecarContainer(env: Environment) {
    if (env.PROXY_PASS === undefined) {
      env.PROXY_PASS = `http://${backendConfig.ALIAS}:${backendConfig.PORT}`;
    }
    if (env.NGINX_PORT === undefined) {
      env.NGINX_PORT = "8080";
    }
    sidecarContainer = await sidecarImage
      .withEnvironment(env)
      .withNetwork(network)
      .withNetworkAliases("sidecar")
      .withExposedPorts(+env.NGINX_PORT)
      .withWaitStrategy(
        Wait.forAll([
          Wait.forListeningPorts(),
          Wait.forLogMessage("serving initial configuration"),
          Wait.forHttp("/healthcheck", +env.NGINX_PORT)
            .forStatusCode(200)
            .forResponsePredicate((response) => response === "OK"),
        ])
      )
      .start();

    sidecarRequester = chai
      .request(
        `http://${sidecarContainer.getHost()}:${sidecarContainer.getFirstMappedPort()}`
      )
      .keepOpen();
  }

  afterEach(async () => {
    if (sidecarContainer) {
      await sidecarContainer.stop();
    }
    if (sidecarRequester) {
      sidecarRequester.close();
    }
  });
  describe("when IP_ALLOW_LIST is not configured", () => {
    describe("basic auth", () => {
      it("should not be required", async () => {
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
        });

        await sidecarRequester.get("/get").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property("method");
          expect(res.body.method).to.equal("GET");
          expect(res.body).to.have.property("path");
          expect(res.body.path).to.equal("/get");
        });

        await sidecarRequester.post("/post").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property("method");
          expect(res.body.method).to.equal("POST");
          expect(res.body).to.have.property("path");
          expect(res.body.path).to.equal("/post");
        });

        await sidecarRequester.put("/put").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property("method");
          expect(res.body.method).to.equal("PUT");
          expect(res.body).to.have.property("path");
          expect(res.body.path).to.equal("/put");
        });

        await sidecarRequester.delete("/delete").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property("method");
          expect(res.body.method).to.equal("DELETE");
          expect(res.body).to.have.property("path");
          expect(res.body.path).to.equal("/delete");
        });

        await sidecarRequester.patch("/patch").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property("method");
          expect(res.body.method).to.equal("PATCH");
          expect(res.body).to.have.property("path");
          expect(res.body.path).to.equal("/patch");
        });

        await sidecarRequester.head("/head").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
        });

        await sidecarRequester.options("/options").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property("method");
          expect(res.body.method).to.equal("OPTIONS");
          expect(res.body).to.have.property("path");
          expect(res.body.path).to.equal("/options");
        });

        // Probably unnecessary as it's part of the container wait strategy, but just to be sure
        await sidecarRequester.get("/healthcheck").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.text;
          expect(res.text).to.equal("OK");
        });
      });
    });
  });

  describe("when IP_ALLOW_LIST is configured", () => {
    describe("basic auth", () => {
      it("should be required if the request is made from a denied IP", async () => {
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
          IP_ALLOW_LIST: JSON.stringify(["203.0.113.0/24"]),
        });

        await sidecarRequester.get("/get").then((res) => {
          expect(res).to.have.status(401);
        });

        await sidecarRequester
          .get("/get")
          .auth("test", "test")
          .then((res) => {
            expect(res).to.have.status(200);
          });

        await sidecarRequester.get("/healthcheck").then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.text;
          expect(res.text).to.equal("OK");
        });
      });

      it("should not be required if the request is made from an allowed IP", async () => {
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
          IP_ALLOW_LIST: JSON.stringify([sourceIp + "/32"]),
        });
        await sidecarRequester.get("/get").then((res) => {
          expect(res).to.have.status(200);
        });

        // test that authless requests are still allowed if the IP is not first in the list
        sidecarContainer.stop();
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
          IP_ALLOW_LIST: JSON.stringify(["203.0.113.0/24", sourceIp + "/32"]),
        });
        await sidecarRequester.get("/get").then((res) => {
          expect(res).to.have.status(200);
        });
      });
    });

    describe("and request is coming from a upstream proxy", () => {
      let caddyContainer: StartedTestContainer;

      before(async function () {
        caddyContainer = await new GenericContainer("caddy:2.7.6-alpine")
          .withNetwork(network)
          .withExposedPorts(8080)
          .withCommand([
            "caddy",
            "reverse-proxy",
            "--from",
            ":8080",
            "--to",
            "sidecar:8080",
          ])
          .start();
      });
      it("sidecar shouldn't trust X-Forwarded-For if the proxy is untrusted", async () => {
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
          NGINX_PORT: "8080",
          IP_ALLOW_LIST: JSON.stringify([sourceIp + "/32"]),
          TRUSTED_PROXIES: JSON.stringify(["203.0.113.0/24"]),
        });

        await chai
          .request(
            `http://${caddyContainer.getHost()}:${caddyContainer.getMappedPort(
              8080
            )}`
          )
          .get("/get")
          .then((res) => {
            expect(res).to.have.status(401);
          });
      });

      it("sidecar should trust X-Forwarded-For if the proxy is trusted", async () => {
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
          NGINX_PORT: "8080",
          IP_ALLOW_LIST: JSON.stringify([sourceIp + "/32"]),
          TRUSTED_PROXIES: JSON.stringify([
            caddyContainer.getIpAddress(network.getName()) + "/32",
          ]),
        });

        await chai
          .request(
            `http://${caddyContainer.getHost()}:${caddyContainer.getMappedPort(
              8080
            )}`
          )
          .get("/get")
          .then((res) => {
            expect(res).to.have.status(200);
          });
      });
    });
  });
});
