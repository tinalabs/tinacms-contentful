const path = require('path');
const autoExternal = require('rollup-plugin-auto-external');
const execute = require('rollup-plugin-execute');
const isTinaDev = process.env.TINA_DEV === "true" || process.env.TINA_DEV === true;

module.exports = {
  rollup(config, options) {
    config.plugins = [
      ...config.plugins,
      autoExternal({
        builtins: true,
        dependencies: false,
        peerDependencies: true,
        packagePath: path.resolve(__dirname, "./package.json"),
      }),
      isTinaDev && execute('yalc push')
    ];

    return config;
  }
}