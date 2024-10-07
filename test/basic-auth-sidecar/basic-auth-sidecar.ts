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
} from "testcontainers";
import { Environment } from "testcontainers/build/types";
import path from "path";
import debug from "debug";

interface RequestData {
  path: string;
  auth?: { username: string; password: string };
  forwardedAddress?: string;
  method?: string;
}

describe("BasicAuthSidecar", function () {
  if (process.env.RUNNER_DEBUG === "1") {
    debug.enable("testcontainers*");
  }

  const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

  let network: StartedNetwork;
  let sidecarImage: GenericContainer;
  let requesterImage: GenericContainer;

  let sidecarContainer: StartedTestContainer;
  let requesterContainer: StartedTestContainer;

  let requesterContainerIp: string;

  const backendConfig = {
    PORT: 8080,
    ALIAS: "backend",
  };

  before(async function () {
    this.timeout(120000);
    network = await new Network().start();

    await new GenericContainer("mendhak/http-https-echo:31")
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

    if (isGitHubActions) {
      requesterImage = new GenericContainer(
        "basic-auth-sidecar-test-httpie:latest"
      );
    } else {
      requesterImage = await GenericContainer.fromDockerfile(
        path.join(path.dirname(__filename), "../../basic-auth-sidecar"),
        "Dockerfile.httpie"
      ).build("basic-auth-sidecar-test-httpie", { deleteOnExit: false });
    }
    requesterContainer = await requesterImage
      .withNetwork(network)
      .withNetworkAliases("requester")
      .withCommand(["sleep", "infinity"])
      .start();

    requesterContainerIp = requesterContainer.getIpAddress(network.getName());

    if (isGitHubActions) {
      sidecarImage = new GenericContainer("basic-auth-sidecar-test:latest");
    } else {
      sidecarImage = await GenericContainer.fromDockerfile(
        path.join(path.dirname(__filename), "../../basic-auth-sidecar")
      ).build("basic-auth-sidecar-test", { deleteOnExit: false });
    }
  });

  async function doRequestInDockerNetwork(
    container: StartedTestContainer,
    port: number | string,
    requestData: RequestData
  ) {
    let command = "http -p hb";
    if (requestData.auth) {
      command += ` -a ${requestData.auth.username}:${requestData.auth.password}`;
    }
    command += ` ${requestData.method} http://${container.getIpAddress(
      network.getName()
    )}:${port}${requestData.path}`;
    if (requestData.forwardedAddress) {
      command += ` "CloudFront-Viewer-Address:${requestData.forwardedAddress}"`;
    }

    const { output } = await requesterContainer.exec([
      "/bin/ash",
      "-c",
      `${command} 2>&1`,
    ]);

    const httpStatus = output.toString().split("\n")[0].split(" ")[1];
    // headers are from the second line until the first empty line
    const headers = new Map();
    let foundEmptyLine = false;
    const body: string[] = [];
    output
      .toString()
      .split("\n")
      .slice(1)
      .forEach((line) => {
        line = line.trim();
        if (line === "") {
          foundEmptyLine = true;
          return;
        }
        if (!foundEmptyLine) {
          const header = line.split(": ");
          headers.set(header[0].toLowerCase(), header[1]);
        } else {
          body.push(line);
        }
      });
    return {
      headers: headers,
      body: body.join("\n"),
      statusCode: +httpStatus,
    };
  }

  async function doSidecarRequest(requestData: RequestData) {
    if (!requestData.method) {
      requestData.method = "GET";
    }
    return doRequestInDockerNetwork(sidecarContainer, "8080", requestData);
  }

  async function startSidecarContainer(env: Environment) {
    if (env.PROXY_PASS === undefined) {
      env.PROXY_PASS = `http://${backendConfig.ALIAS}:${backendConfig.PORT}`;
    }
    if (env.NGINX_PORT === undefined) {
      env.NGINX_PORT = "8080";
    }
    if (env.TRUSTED_PROXIES === undefined) {
      env.TRUSTED_PROXIES = "";
    }
    if (env.IP_ALLOW_LIST === undefined) {
      env.IP_ALLOW_LIST = "";
    }
    sidecarContainer = await sidecarImage
      .withEnvironment(env)
      .withNetwork(network)
      .withNetworkAliases("sidecar")
      .withExposedPorts(+env.NGINX_PORT)
      .withWaitStrategy(
        Wait.forAll([
          Wait.forListeningPorts(),
          Wait.forLogMessage("start worker process"),
          Wait.forHttp("/healthcheck", +env.NGINX_PORT)
            .forStatusCode(200)
            .forResponsePredicate((response) => response === "OK"),
        ])
      )
      .start();
  }

  afterEach(async () => {
    if (sidecarContainer) {
      await sidecarContainer.stop();
    }
  });

  context("when IP_ALLOW_LIST is configured", () => {
    describe("SERVER header", () => {
      it("should not be present", async () => {
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
        });
        await doSidecarRequest({ path: "/get" }).then(({ headers }) => {
          expect(headers).to.not.be.empty;
          expect(headers.has("server")).to.be.false;
        });
      });
    });
    describe("basic auth", () => {
      it("should be required if the request is made from a denied IP", async () => {
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
          IP_ALLOW_LIST: JSON.stringify(["203.0.113.0/24"]),
        });

        await doSidecarRequest({ path: "/get" }).then(({ statusCode }) => {
          expect(statusCode).to.equal(401);
        });

        await doSidecarRequest({
          path: "/get",
          auth: {
            username: "test",
            password: "test",
          },
        }).then(({ statusCode }) => {
          expect(statusCode).to.equal(200);
        });

        await doSidecarRequest({ path: "/healthcheck" }).then(
          ({ statusCode, headers, body }) => {
            expect(statusCode).to.equal(200);
            expect(headers.get("content-type")).to.equal("text/plain");
            expect(body).to.equal("OK");
          }
        );
      });

      it("should not be required if the request is made from an allowed IP", async () => {
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
          IP_ALLOW_LIST: JSON.stringify([requesterContainerIp + "/32"]),
        });
        await doSidecarRequest({ path: "/get" }).then(({ statusCode }) => {
          expect(statusCode).to.equal(200);
        });

        // test that authless requests are still allowed if the IP is not first in the list
        sidecarContainer.stop();
        await startSidecarContainer({
          BASIC_AUTH_USERNAME: "test",
          BASIC_AUTH_PASSWORD: "test",
          IP_ALLOW_LIST: JSON.stringify([
            "203.0.113.0/24",
            requesterContainerIp + "/32",
          ]),
        });

        await doSidecarRequest({ path: "/get" }).then(({ statusCode }) => {
          expect(statusCode).to.equal(200);
        });
      });
      context("when cloudfront is involved", () => {
        let caddyContainer: StartedTestContainer;

        before(async function () {
          this.timeout(120000);
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

        it("should be required if cloudfront sends a non-allowed address", async () => {
          await startSidecarContainer({
            BASIC_AUTH_USERNAME: "test",
            BASIC_AUTH_PASSWORD: "test",
            IP_ALLOW_LIST: JSON.stringify([requesterContainerIp + "/32"]),
          });

          await doRequestInDockerNetwork(caddyContainer, 8080, {
            path: "/get",
            method: "GET",
            forwardedAddress: "203.0.113.0:8145",
          }).then(({ statusCode }) => {
            expect(statusCode).to.equal(401);
          });
        });

        it("should not be required if cloudfront sends an allowed address", async () => {
          await startSidecarContainer({
            BASIC_AUTH_USERNAME: "test",
            BASIC_AUTH_PASSWORD: "test",
            IP_ALLOW_LIST: JSON.stringify([requesterContainerIp + "/32"]),
          });

          await doRequestInDockerNetwork(caddyContainer, 8080, {
            path: "/get",
            method: "GET",
            forwardedAddress: `${requesterContainerIp}:8145`,
          }).then(({ statusCode }) => {
            expect(statusCode).to.equal(200);
          });
        });
      });
    });
  });
});
