# Contributing

The following outlines the guidelines for contributing to this package.

## TSDX Bootstrap

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

### `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### Linking for local development

If you are want to test local changes to `react-tinacms-contentful`, we recommend using webpack aliases rather than using npm/yarn link.

For example, in a NextJS site, your `next.config.js` would look like:

```
const path = require("path");

const tinaWebpackHelpers = require("@tinacms/webpack-helpers");

module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.resolve.alias["@tinacms/react-tinacms-contentful"] = path.resolve(
        "../react-tinacms-contentful"
      );
      config.resolve.alias["react-beautiful-dnd"] = path.resolve(
        "./node_modules/react-beautiful-dnd"
      );

      tinaWebpackHelpers.aliasTinaDev(config, "../tinacms");
    }

    return config;
  },
  // ...
};
```