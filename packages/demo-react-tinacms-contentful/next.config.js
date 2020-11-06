const { configureNext } = require("tinacms-doc-toolkit");

require("dotenv").config({
  path: "../../.env"
});

module.exports = (phase, { defaultConfig }) => {
  const config = configureNext(defaultConfig);

  return {
    ...config,
    env: {
      CONTENTFUL_CLIENT_ID: process.env.CONTENTFUL_CLIENT_ID,
      CONTENTFUL_DEFAULT_ENVIRONMENT_ID:
        process.env.CONTENTFUL_DEFAULT_ENVIRONMENT_ID,
      CONTENTFUL_REDIRECT_URL: process.env.CONTENTFUL_REDIRECT_URL,
      CONTENTFUL_ALLOWED_HOSTNAME: process.env.CONTENTFUL_ALLOWED_HOSTNAME,
      CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_POC_SPACE_ID,
      CONTENTFUL_DELIVERY_ACCESS_TOKEN:
        process.env.CONTENTFUL_POC_DELIVERY_ACCESS_TOKEN,
      CONTENTFUL_PREVIEW_ACCESS_TOKEN:
        process.env.CONTENTFUL_POC_PREVIEW_ACCESS_TOKEN,
    }
  };
};
