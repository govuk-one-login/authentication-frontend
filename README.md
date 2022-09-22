# di-authentication-frontend

## Clone the repo

> Clone this repo to your local machine

```shell script
git@github.com:alphagov/di-authentication-frontend.git
```

Clones the repository to the `<your_folder_name` directory.

## Running the app in Docker

Before you can run the frontend app against the backend you will need to configure some environment variables.

### Set the Environment variables

Create a copy of the .env.sample file and rename it .env and fill in below values:

```
ENVIRONMENT=development
API_BASE_URL=
FRONTEND_API_BASE_URL=
SESSION_EXPIRY=30000
SESSION_SECRET=123456
API_KEY=
ANALYTICS_COOKIE_DOMAIN=localhost
SERVICE_DOMAIN=localhost
```

You can find the `API_BASE_URL` in [Concourse](https://cd.gds-reliability.engineering/teams/verify/pipelines/di-authentication-deployment) under the outputs within the deploy-oidc-api-{environment} job, where {environment} is the name of the environment you want to connect to.

`UI_LOCALES` can be used be the stub to request specific locales when authorising.  Only 'en' and 'cy' are supported.

Run `docker-compose up` or the `startup.sh` script.

In `docker-compose.yaml` you will see three services which need to be started to run the frontend locally, the frontend itself, a lightweight stub client, and a redis instance. 

When starting for the first time, or after a clean, the frontend will take a few minutes to start as node needs to install all the dependencies.

To find out if the application has started, open a console window on the frontend docker container and view the logs. If the server has started successfully you will see this message `Server listening on port 3000`.  If this does not appear try forcing node to restart by updating one of the `.njk` files.

Navigate to the stub app [http://localhost:2000](http://localhost:2000).  This acts like a local client to create a backend session and redirect to the start page.

Changes made locally will automatically be deployed after a few seconds. You should check the docker console to check that your changes have been picked up by the restart.

### Switching between different Scopes and Levels of Confidence

In the deployed stubs, you are given the option in a UI to select things like scopes and desired level of confidence. When running locally, it does not work the same way as you never see a stub UI. These equivalent parameters are defined in `dev-app.js`. In order to change them, you need to tweak the `AUTHORIZE_REQUEST` constant. One easy way to see a valid 'shape' for your desired set of options is to use a deployed stub (e.g. the Build environment stub), inspect the network calls, and have a look at the request payload directed to the `/authorize` endpoint. You can copy any relevant parts across into `dev-app.js`. For example, to increase Levels of Confidence from P0 to P2, you would need to add this line. Note that this must be URL encoded so `[` becomes `%5B` for example:

```
const AUTHORIZE_REQUEST =
  process.env.API_BASE_URL +
  "/authorize?" +
  "vtr=%5B%22P2.Cl.Cm%22%5D&" + <= THIS LINE
  "scope=openid+phone+email&" +
  "response_type=code&" +
  "redirect_uri=https%3A%2F%2F" + process.env.STUB_HOSTNAME + "%2Foidc%2Fauthorization-code%2Fcallback&" +
  "state=sEazICy8jKFFlt-NLSw5yqYRA2r4q5BZGcAf9sYeWRg&" +
  "nonce=gyRdMfQGsQS9BvhU-lBwENOZ0UU&" +
  "client_id=" + process.env.TEST_CLIENT_ID +
  "&cookie_consent=accept" +
  "&_ga=test";
```

### Running the tests

The unit tests have been written with Mocha and Supertest.

If the app is run in a container then the tests are run there too:

```shell script
docker exec -it di-authentication-frontend_di-auth-frontend /bin/sh

# yarn run test:unit
```

### Restarting the app

You can restart the app by re-running the `startup.sh` script, or restarting docker-compose.

For a clean start run `./startup.sh -c`

## Other useful yarn commands

Remember to run these commands in the docker container itself.

### Development

> To run the app in development mode with nodemon watching the files

```shell script
yarn dev
```

Starts a nodemon server serving the files from the `dist/`
directory.

### Build

> To build the app

```shell script
yarn build
```

### Start

> To run the built app

```shell script
yarn start
```

Starts a node server pointing to the entry point found in
the build directory.

### Unit tests

> To run the unit tests

```shell script
yarn test:unit
```

Runs all unit tests found in the `tests/unit/` directory
using mocha.

### Integration tests

> To run the integration tests

```shell script
yarn test:integration
```


### Install dependencies

> To install dependencies, run yarn install

```shell script
yarn install
```

Installs the dependencies required to run the application.

### Coverage

> To get a coverage report

```shell script
yarn test:coverage
```

### Linting

> To run lint checks

```shell script
yarn lint
```

Checks if the code conforms the linting standards.
