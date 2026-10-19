import http from 'node:http';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';

const app = createApp();
const server = http.createServer(app);

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`EduSync API could not start because port ${env.PORT} is already in use.`);
  } else {
    console.error('EduSync API failed to listen', error);
  }
  process.exit(1);
});

async function start() {
  console.log('Starting EduSync API...');
  await connectDatabase();
  server.listen(env.PORT, () => {
    console.log(`EduSync API listening on port ${env.PORT}`);
  });
}

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((error) => {
  console.error('Failed to start EduSync API', error);
  process.exit(1);
});
