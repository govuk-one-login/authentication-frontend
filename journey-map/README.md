# Authentication Journey Map

This is a small JavaScript-based tool to display the journey map in an interactive page

## Prerequisites

- Node and NPM installed

## Running the map

- Run `npm install` to install dependencies.
- Run `npm run dev` to start the application in watch mode
- Open [http://localhost:3000] in a web browser

### Linting and typechecking

Linting and typechecking are available with `npm run lint` and `npm run tsc`.

### Build process

To build:

- `npm run build` will build the frontend JavaScript into `/public`
- `npm run build-server` will build the server code into `/build`

Use `npm start` to run the built code.

In production, the journey map is bundled with the main application container and served in non-production environments.
See `../Dockerfile`.

## Using the map

You should be able to pan and zoom using the mouse and scroll wheel.

The options header provides controls over which routes are displayed.

## Implementation

We run a very lightweight express server to serve the static HTML and JS,
and provide a route to expose the journey map as a JSON object.

The frontend converts this to mermaid format, and renders using two publicly available libraries:

- [mermaid-js](https://mermaid.js.org/)
- [svg-pan-zoom](https://github.com/bumbu/svg-pan-zoom)
