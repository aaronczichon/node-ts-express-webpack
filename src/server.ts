import * as http from "http";
import "reflect-metadata";
import * as throng from "throng";
import * as express from "express";

const httpPort = normalizePort(process.env.PORT || 3000);
const WORKERS = process.env.WEB_CONCURRENCY || (1 as throng.WorkerCount);

throng({
  workers: WORKERS,
  lifetime: Infinity,
  start: startServer
});

function startServer(workerId: number) {
  // Defining the server
  const app: express.Application = express();

  // Setting port
  app.set("port", httpPort);

  // Register dummy endpoint
  app.get("/api/v1/test", (_req, res) => {
    res.send({ message: "Hi" });
  });

  // register http server and configure
  const httpServer = http.createServer(app);
  httpServer.listen(httpPort);
  httpServer.on("listening", onListening);
  httpServer.on("error", onError);

  console.info("Started cluster worker with id:", workerId);

  function onListening() {
    const addr = httpServer.address();
    const bind =
      typeof addr === "string" ? "pipe " + addr : "port " + addr!.port;
    console.log("Listening on " + bind);
  }
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind =
    typeof httpPort === "string" ? "Pipe " + httpPort : "Port " + httpPort;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

process.on("exit", e => {
  console.log("Uncaught Error:", e);
});
