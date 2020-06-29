// need to "absolute" import like import config from 'config' work corectly
const tsConfig = require('../tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

const baseUrl = './dist'; // Either absolute or relative path. If relative it's resolved to current working directory.
tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

import app from "./app";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT);

console.log(`Fastify server running on port ${PORT}`);
