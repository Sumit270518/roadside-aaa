const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Server } = require('socket.io');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { setupSocket } = require('./sockets/socketHandler');
const { isOriginAllowed } = require('./config/cors');

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO with unified CORS origin validation
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  },
});

// Attach socket.io to express app for access in controllers
app.set('io', io);

// Setup Socket events & auth
setupSocket(io);

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, HOST, () => {
      console.log(`[Roadside AAA Server] Running on http://${HOST}:${PORT}`);
      console.log(`[Roadside AAA Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error(`[Server Start Error] ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const handleExit = async () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(async () => {
    await disconnectDB();
    console.log('[Server] Process terminated.');
    process.exit(0);
  });
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

startServer();

module.exports = { server, app };
