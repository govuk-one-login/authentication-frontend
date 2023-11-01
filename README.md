# di-authentication-frontend

## Clone the repo

> Clone this repo to your local machine

```shell script
git@github.com:alphagov/di-authentication-frontend.git
```

Clones the repository to the `<your_folder_name` directory.

## Running the app

There are two different ways to run the app on a local machine:

- Everything running in Docker
- The frontend app running in a local node instance, with supporting services running in Docker

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

`UI_LOCALES` can be used be the stub to request specific locales when authorising.  Only 'en' and 'cy' are supported.

### Starting all services in Docker

Run one of the following:

```shell script
docker compose up

./startup.sh
```

### Starting the frontend in node locally outside of Docker

In this case supporting services (redis and stubs) run in Docker but the frontend itself runs outside.  Development can be quicker and more responsive if done in this way.

The startup script will do this for you so just run this command:

```shell script
./startup.sh -l
```

### General guidance on starting the application

When starting for the first time, or after a clean, the frontend will take a few minutes to start as node needs to install all the dependencies.

To find out if the application has started, open a console window on the frontend docker container and view the logs. If the server has started successfully you will see this message `Server listening on port 3000`.  If this does not appear try forcing node to restart by updating one of the `.njk` files.

If things do not appear to be working it can be a good idea to start with a clean deployment:

```shell script
yarn clean
```

Additionaly delete the Docker images for all the frontend services in docker-compose.yml.

There are two stub apps you can use to start a journey.

To start an auth only journey with MFA required ("Cm"), navigate to the stub app on port 2000 [http://localhost:2000](http://localhost:2000).  This acts like a local client to create a backend session and redirect to the start page.

To start an auth only journey with no MFA ("Cl"), navigate to the stub app on port 5000 [http://localhost:5000](http://localhost:5000).

Changes made locally will automatically be deployed after a few seconds. You should check the docker console to check that your changes have been picked up by the restart.

### Switching between different Vectors of Trust

You can further tweak the vector of trust (VTR) requested by the stub client on port 5000 by editing `docker-compose.yml`
and changing the `VTR` environment variable for the `di-auth-stub-no-mfa` service:

```
  di-auth-stub-no-mfa:
    build:
      context: .
      dockerfile: Dockerfile-stub
    links:
      - di-auth-frontend
    ports:
      - "5000:5000"
    environment:
      - ENVIRONMENT=${ENVIRONMENT}
      - API_BASE_URL=${API_BASE_URL}
      - FRONTEND_API_BASE_URL=${FRONTEND_API_BASE_URL}
      - TEST_CLIENT_ID=${TEST_CLIENT_ID}
      - STUB_HOSTNAME=${STUB_HOSTNAME}
      - UI_LOCALES=${UI_LOCALES}
      - VTR=["Cl"] <== Edit this line
      - PORT=5000
```

You can also add an additional service with a different VTR by duplicating the `di-auth-stub-no-mfa` service,
giving it a new name and amending the `PORT` and `VTR` environment variables. The `ports` entry, must reflect the port
number in the `PORT` environment variable. Each service must have a unique port number.

### Running the tests

The unit tests have been written with Mocha and Supertest.

If the app is run in a container then the tests are run there too:

```shell script
docker exec -it di-authentication-frontend_di-auth-frontend /bin/sh

yarn run test:unit
```

### Restarting the app

You can restart the app by re-running the `startup.sh` script, or restarting docker-compose.

For a clean start run `./startup.sh -c`

### Pre-flight checks

Before committing or creating a PR it is a good idea to run all checks and tests.  The `pre-commit` script can be used to do this.  It runs:

- All pre-commit checks defined in `.pre-commit-config.yaml`
- The app in Docker
- Unit tests
- Integration tests

Pre-commit checks include applying formatting, so after the script has run you may see files updated with formatting changes.  Running pre-commit before every PR ensures that all files in the repo are formatted correctly.

```shell script
./pre-commit.sh
```

You may need to install pre-commit for the script to work.

```shell script
brew install pre-commit
```

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
