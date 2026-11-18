require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const configuredOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const isLocalPreview = (value = '') => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(value);
const allowOrigin = (value, callback) => {
  if (!value || value === configuredOrigin || isLocalPreview(value)) return callback(null, true);
  callback(new Error('Origin not allowed by CORS'));
};
const corsOptions = { origin: allowOrigin };
const io = new Server(server, { cors: corsOptions });
app.set('io', io);

app.use(cors(corsOptions));
app.use(express.json());

// Express 4 doesn't catch async errors by itself, so wrap handlers
const wrap = (router) => {
  router.stack.forEach((layer) => {
    if (layer.route) layer.route.stack.forEach((l) => {
      const fn = l.handle;
      if (fn.length <= 2) l.handle = (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
    });
  });
  return router;
};

app.use('/api/auth', wrap(require('./routes/auth')));
app.use('/api/tasks', wrap(require('./routes/tasks')));
app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.name === 'ValidationError' ? 400 : 500).json({ message: err.message || 'Something went wrong.' });
});

// Real-time: each user joins a private room after presenting a valid JWT
io.use((socket, next) => {
  try {
    socket.userId = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET).id;
    next();
  } catch { next(new Error('unauthorized')); }
});
io.on('connection', (socket) => socket.join(`user:${socket.userId}`));

const port = process.env.PORT || 5000;

async function startServer() {
  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
    console.log('No valid MONGO_URI configured, spinning up an embedded in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log('In-memory MongoDB running at:', mongoUri);
  }

  try {
    await mongoose.connect(mongoUri);
    server.listen(port, () => console.log('API running on port', port));
  } catch (e) {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  }
}

startServer();
