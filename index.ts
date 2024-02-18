#!/usr/bin/env node

import { NotificationService } from "./src/services/shared/notificationService";
import { AppointmentService } from "./src/services/shared/appointmentService";
import { SubscriptionService } from "./src/services/shared/subscriptionService";
import { Db } from "./src/config/db";

/**
 * Module dependencies.
 */
const app = require('./src/app');
const debug = require('debug')('flickapi:server');
const http = require('http');
const db = require('./src/config/db');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '80');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
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

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

/**
 * Mongoose/MongoDb connection
 */

connectDb();

function connectDb() {
  const db = new Db();
  db.connectDb().then(async (successful) => {
    if (successful) {
      db.registerModels();
      NotificationService.beginCheckForInvalidTokens();
      AppointmentService.beginCheckForApproachingAppointments();
      // UserService.setDefaultDoctorRoles();
      await SubscriptionService.createSubscriptions();
      listen();
    } else {
      process.exit(1);
    }
  });
}

function listen() {
  console.log('>>> Attempting to listen on: ', port);
  server.listen(port);
}

process.on('uncaughtException', (err) => {
  console.error(`>>>> Uncaught Exception: ${err.message}`);
  // process.exit(1)
});
