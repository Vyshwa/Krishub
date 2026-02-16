const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const net = require('net');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(morgan('dev'));

const MONGODB_URI = process.env.MONGODB_URI || '';
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
let mongod = null;

async function findAvailablePort(preferred) {
  function check(port) {
    return new Promise((resolve) => {
      const server = net
        .createServer()
        .once('error', () => resolve(false))
        .once('listening', () => server.close(() => resolve(true)))
        .listen(port);
    });
  }
  for (let p = preferred; p < preferred + 50; p++) {
    // try 50 ports ahead
    // eslint-disable-next-line no-await-in-loop
    if (await check(p)) return p;
  }
  return 0; // let OS assign a free port
}

const start = async () => {
  try {
    if (!MONGODB_URI) {
      console.warn('MONGODB_URI not set; starting in-memory MongoDB for development');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri, { dbName: process.env.MONGODB_DB || 'krishub-dev' });
      console.log('MongoDB (memory) connected');
    } else {
      await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || 'krishub' });
      console.log('MongoDB connected');
    }

    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
    });
    app.get('/', (_req, res) => {
      res.json({ name: 'Krishub API', status: 'ok' });
    });

    const contactsRouter = require('./routes/contacts');
    app.use('/api/contact-forms', contactsRouter);
    const authRouter = require('./routes/auth');
    app.use('/api/auth', authRouter);

    const portToUse = await findAvailablePort(PORT);
    const server = app.listen(portToUse, () => {
      const actualPort = server.address().port;
      console.log(`Server listening on http://localhost:${actualPort}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

process.on('SIGINT', async () => {
  if (mongod) {
    await mongod.stop();
  }
  process.exit(0);
});
