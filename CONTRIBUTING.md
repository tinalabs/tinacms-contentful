# Contributing

The following outlines the guidelines for contributing to this package.

## Pre-requisites

The same pre-requisites found in the [README](./README.md).

### Development

`yarn start` will start a development CLI for each package, running them all in parallel, watching for changes and rebuilding where applicable.

### Production Builds

`yarn build` bundles all packages to a `dist` folder in the root of each package. 

The built package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### Publishing

Publishing packages can be done by running `yarn run publish`, which runs an interactive prompt to publish packages with changes.

### Linking for local development

If you are want to test local changes to `react-tinacms-contentful`, we recommend using webpack aliases rather than using npm/yarn link if using webpack, or use [Yalc](https://github.com/wclr/yalc) as a local NPM registry.

For example, in a Next.js site, your `next.config.js` would look like:

```
const path = require("path");

module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.resolve.alias["tinacms-contentful"] = path.resolve(
        "../react-tinacms-contentful"
      );
      config.resolve.alias["react-tinacms-contentful"] = path.resolve(
        "../react-tinacms-contentful"
      );
      config.resolve.alias["next-tinacms-contentful"] = path.resolve(
        "../react-tinacms-contentful"
      );
    }

    return config;
  },
  // ...
};
```

## Test Suites

This monorepo is tested using Jest and Contentful.

### Pre-requisites

Before running the tests, you must setup a local `.env` file with secrets for a "test" space in Contentful setup from the [Contentful 
"Example App"](https://the-example-app-nodejs.contentful.com) example space when creating the new space.

The required environment variables are outlined in `.env.sample`.

### Running Tests

The tests can be ran by running:

```
yarn test
```

To run tests for a specific package, run:

```
yarn test --scope package-name
```

> E.g, `yarn test --scope tinacms-contentful`
