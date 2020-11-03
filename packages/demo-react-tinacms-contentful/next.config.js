const { configureNext } = require("tinacms-doc-toolkit");

module.exports = (phase, { defaultConfig }) => {
  const config = configureNext(defaultConfig);

  return config;
};
