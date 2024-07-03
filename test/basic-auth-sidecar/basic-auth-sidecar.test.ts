import chai from "chai";
import chaiHttp from "chai-http";
import { describe } from "mocha";

const tar = require("tar-stream");

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
    path: string,
    auth?: { username: string; password: string },
    method: string = "GET"
  ) {
    let command = "http -p hb";
    if (auth) {
      command += ` -a ${auth.username}:${auth.password}`;
    }
    command += ` ${method} http://${container.getIpAddress(
      network.getName()
    )}:${port}${path}`;

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

  async function doSidecarRequest(
    path: string,
    auth?: { username: string; password: string },
    method: string = "GET"
  ) {
    return doRequestInDockerNetwork(
      sidecarContainer,
      "8080",
      path,
      auth,
      method
    );
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

  async function getTextFileFromContainer(
    container: StartedTestContainer,
    path: string
  ): Promise<string> {
    const tarStream = tar.extract();
    const tarArchiveStream = await container.copyArchiveFromContainer(path);
    tarArchiveStream.pipe(tarStream);
    let fileContent = "";
    tarStream.on("entry", (header: any, stream: any, next: any) => {
      stream.on("data", (chunk: any) => {
        fileContent += chunk.toString();
      });
      stream.on("end", () => {
        next();
      });
      stream.resume();
    });
    tarStream.on("finish", () => {
      tarStream.end();
    });

    return new Promise((resolve) => {
      tarStream.on("finish", () => {
        resolve(fileContent);
      });
    });
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
        await doSidecarRequest("/get").then(({ headers }) => {
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

        await doSidecarRequest("/get").then(({ statusCode }) => {
          expect(statusCode).to.equal(401);
        });

        await doSidecarRequest("/get", {
          username: "test",
          password: "test",
        }).then(({ statusCode }) => {
          expect(statusCode).to.equal(200);
        });

        await doSidecarRequest("/healthcheck").then(
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
        await doSidecarRequest("/get").then(({ statusCode }) => {
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

        await doSidecarRequest("/get").then(({ statusCode }) => {
          expect(statusCode).to.equal(200);
        });
      });
    });

    context("and request is coming from a upstream proxy", () => {
      context("and there is just one proxy in the chain", () => {
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
        it("shouldn't trust X-Forwarded-For if the proxy is untrusted", async () => {
          await startSidecarContainer({
            BASIC_AUTH_USERNAME: "test",
            BASIC_AUTH_PASSWORD: "test",
            NGINX_PORT: "8080",
            IP_ALLOW_LIST: JSON.stringify([requesterContainerIp + "/32"]),
            TRUSTED_PROXIES: JSON.stringify(["203.0.113.0/24"]),
          });

          await doRequestInDockerNetwork(caddyContainer, "8080", "/get").then(
            ({ statusCode }) => {
              expect(statusCode).to.equal(401);
            }
          );
        });

        it("should trust X-Forwarded-For if the proxy is trusted", async () => {
          const trustedProxiesList = [
            caddyContainer.getIpAddress(network.getName()) + "/32",
          ];
          await startSidecarContainer({
            BASIC_AUTH_USERNAME: "test",
            BASIC_AUTH_PASSWORD: "test",
            NGINX_PORT: "8080",
            IP_ALLOW_LIST: JSON.stringify([requesterContainerIp + "/32"]),
            TRUSTED_PROXIES: JSON.stringify(trustedProxiesList),
          });

          const trustedProxiesConf = await getTextFileFromContainer(
            sidecarContainer,
            "/etc/nginx/trusted-proxies.conf"
          );

          for (const proxy of trustedProxiesList) {
            expect(trustedProxiesConf).to.contain(`set_real_ip_from ${proxy};`);
          }

          await doRequestInDockerNetwork(caddyContainer, "8080", "/get").then(
            ({ statusCode }) => {
              expect(statusCode).to.equal(200);
            }
          );
        });
      });
      context("and there are multiple proxies in the chain", () => {
        let outerCaddyContainer: StartedTestContainer;
        let innerCaddyContainer: StartedTestContainer;

        before(async () => {
          outerCaddyContainer = await new GenericContainer("caddy:2.7.6-alpine")
            .withNetwork(network)
            .withExposedPorts(8080)
            .withCommand([
              "caddy",
              "reverse-proxy",
              "--from",
              ":8080",
              "--to",
              "inner-caddy:8080",
            ])
            .start();

          const innerCaddyfileContent = `:8080
          reverse_proxy {
            to "sidecar:8080"
            trusted_proxies ${outerCaddyContainer.getIpAddress(network.getName()) + "/32"}
          }
          `;
          innerCaddyContainer = await new GenericContainer("caddy:2.7.6-alpine")
            .withNetwork(network)
            .withNetworkAliases("inner-caddy")
            .withExposedPorts(8080)
            .withCopyContentToContainer([
              {
                content: innerCaddyfileContent,
                target: "/etc/caddy/Caddyfile",
              },
            ])
            .withCommand(["caddy", "run", "--config", "/etc/caddy/Caddyfile"])
            .start();
        });

        it("should trust X-Forwarded-For if all proxies are trusted", async () => {
          const trustedProxiesList = [
            outerCaddyContainer.getIpAddress(network.getName()) + "/32",
            innerCaddyContainer.getIpAddress(network.getName()) + "/32",
          ];
          await startSidecarContainer({
            BASIC_AUTH_USERNAME: "test",
            BASIC_AUTH_PASSWORD: "test",
            NGINX_PORT: "8080",
            IP_ALLOW_LIST: JSON.stringify([requesterContainerIp + "/32"]),
            TRUSTED_PROXIES: JSON.stringify(trustedProxiesList),
          });

          const trustedProxiesConf = await getTextFileFromContainer(
            sidecarContainer,
            "/etc/nginx/trusted-proxies.conf"
          );

          for (const proxy of trustedProxiesList) {
            expect(trustedProxiesConf).to.contain(`set_real_ip_from ${proxy};`);
          }

          await doRequestInDockerNetwork(
            outerCaddyContainer,
            "8080",
            "/get"
          ).then(({ statusCode }) => {
            expect(statusCode).to.equal(200);
          });
        });

        it("shouldn't trust X-Forwarded-For if any proxy is untrusted", async () => {
          const trustedProxiesList = [
            outerCaddyContainer.getIpAddress(network.getName()) + "/32",
            innerCaddyContainer.getIpAddress(network.getName()) + "/32",
          ];

          for (const proxy of trustedProxiesList) {
            await startSidecarContainer({
              BASIC_AUTH_USERNAME: "test",
              BASIC_AUTH_PASSWORD: "test",
              NGINX_PORT: "8080",
              IP_ALLOW_LIST: JSON.stringify([requesterContainerIp + "/32"]),
              TRUSTED_PROXIES: JSON.stringify([proxy]),
            });

            await doRequestInDockerNetwork(
              outerCaddyContainer,
              "8080",
              "/get"
            ).then(({ statusCode }) => {
              expect(statusCode).to.equal(401);
            });

            await sidecarContainer.stop();
          }
        });
      });
    });
  });
});
