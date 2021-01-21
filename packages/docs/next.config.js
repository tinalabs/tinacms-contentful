const { configureNext } = require("tinacms-doc-toolkit");
const { resolve } = require('path');
const glob = require('glob');

const BASE_PATH = process.env.NEXT_BASE_PATH || ""
const ASSET_PREFIX = process.env.NEXT_ASSET_PREFIX || BASE_PATH
const CONTENT_DIR = resolve(process.cwd(), "content");
const PAGE_PATHS = glob.sync(`${CONTENT_DIR}/*.mdx`)
  .map(pagePath => pagePath
    .replace(CONTENT_DIR, '') // Make relative
    .replace(/\.mdx$/, '') // Remove extension
  )
  .sort((a, b) => { 
    // Sort alphabetically, giving priority to index
    if (a.endsWith("/index")) return -1;
    if(a < b) { return -1; }
    if(a > b) { return 1; }
    return 0;
  });

module.exports = configureNext({
  env: {
    pagePaths: PAGE_PATHS
  },
  basePath: BASE_PATH,
  assetPrefix: ASSET_PREFIX
})