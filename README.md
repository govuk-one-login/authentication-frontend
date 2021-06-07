# di-authentication-frontend

- [Installation](#installation)
    - [Clone](#clone)
    - [Install Dependencies](#install-dependencies)
- [Run Web App](#run-web-app)
    - [Development](#development)
    - [Build](#build)
    - [Start](#start)
- [Testing](#testing)
    - [Unit](#unit)
    - [Coverage](#coverage)
    - [Linting](#linting)
- [License](#license)

## Installation

### Clone

> Clone this repo to your local machine

```shell script
git@github.com:alphagov/di-authentication-frontend.git
```

Clones the repository to the `<your_folder_name` directory.

### Install dependencies

> To install dependencies, run yarn install

```shell script
yarn install
```

Installs the dependencies required to run the application.

## Run web app

### Environment variables

TBA

### Development

> To run the app in development mode with nodemon watching the files

```shell script
yarn dev
```

Starts a nodemon server serving the files from the `app/`
directory.

### Build

> To build the app

```shell script
yarn build
```

This will build the application using webpack and
`webpack/webpack.prod.js` configurations, generating
a build directory in the root directory.

### Start

> To run the built app

```shell script
yarn start
```

Starts a node server pointing to the entry point found in
the build directory.

## Testing

The unit tests have been written with Mocha. The end to end tests are using CodeceptJS with Gherkin due
to a better cross-browser testing support.

### Unit

> To run the unit tests

```shell script
yarn test:unit
```

Runs all unit tests found in the `test/unit/` directory
using mocha.

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