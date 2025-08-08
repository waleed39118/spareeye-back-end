const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(morgan('combined'));
app.use(compression());

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));


let corsOrigins = ['http://localhost:5173'];
if (process.env.CORS_ORIGIN !== undefined) {
  if (process.env.CORS_ORIGIN !== '') {
    corsOrigins = process.env.CORS_ORIGIN.split(',');
  }
}
app.use(cors({ origin: corsOrigins, credentials: true }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routers
const testJwtRouter = require('./controllers/test-jwt');
const authRouter = require('./controllers/auth');
const userRouter = require('./controllers/users');
const requestRouter = require('./controllers/requests');

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/requests', requestRouter);
app.use('/test-jwt', testJwtRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  let status = 500;
  if (err.statusCode !== undefined) {
    status = err.statusCode;
  }
  const message = (err.message !== undefined && err.message !== null && err.message !== '') ? err.message : 'Internal Server Error';
  res.status(status).json({ message });
});


const startServer = async () => {
  if (process.env.MONGODB_URI === undefined) {
    console.error('MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }
  if (process.env.MONGODB_URI === '') {
    console.error('MONGODB_URI is empty. Aborting.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB ${conn.connection.name}`);


    let PORT = 3000;
    if (process.env.PORT !== undefined) {
      if (process.env.PORT !== '') {
        PORT = Number(process.env.PORT);
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });


    const shutdown = async () => {
      console.log('Shutting down server...');
      try {
        await mongoose.disconnect();
      } catch (e) {
        console.error('Error while disconnecting mongoose:', e);
      }
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);


    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

startServer();
