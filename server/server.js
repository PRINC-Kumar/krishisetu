import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { registerNegotiationSocket } from "./sockets/negotiation.socket.js";
import { logger } from "./utils/logger.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientUrl, credentials: true },
});

registerNegotiationSocket(io);

connectDB()
  .then(() =>
    server.listen(env.port, () =>
      logger.info(`API running on port ${env.port}`),
    ),
  )
  .catch((error) => logger.error("Failed to start server", error));
