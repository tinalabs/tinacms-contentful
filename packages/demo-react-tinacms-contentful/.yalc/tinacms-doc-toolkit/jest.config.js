const { createJestConfig } = require("@tinacms/scripts");
const pack = require("./package.json");
module.exports = createJestConfig(pack);
