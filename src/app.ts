import * as fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import * as mongoose from 'mongoose';
import * as path from "path";

import config from "config";
import { onFile } from "utils/fileSaver";
import router, { registerAuth } from "./router";


mongoose.set('debug', !!(process.env.NODE_ENV === "development"));
mongoose.connect(config.mongo.url, config.mongo.options as any);
mongoose.connection.on('error', console.error);

const serverOptions: fastify.ServerOptions = {
  // Logger only for production
  logger: config.isDev
};

const app: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify(serverOptions);

const options = {
  addToBody: true,
  sharedSchemaId: 'MultipartFileType', // Optional shared schema id
  onFile: onFile,
  limit: { /*...*/ } // You can the limit options in any case
}

app.register(require('fastify-cors'))
app.register(require('fastify-static'), { root: path.join(__dirname,"../public"), prefix: "/public/" })
app.register(require('fastify-multipart'), options)
app.register(router);
app.register(registerAuth);

export default app;