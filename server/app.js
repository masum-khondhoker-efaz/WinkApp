import express from 'express';
import router from './routes/api.js';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import * as path from 'node:path';
import {
  DefaultErrorHandler,
  NotFoundError,
} from './app/utilities/ErrorHandler.js';
import {
  MAX_JSON_SIZE,
  REQUEST_NUMBER,
  REQUEST_TIME,
  URL_ENCODE,
  WEB_CACHE,
} from './app/config/config.js';
import fileUpload from 'express-fileupload';

const app = express();

// App use default middlewares
app.use(cors());

app.use(bodyParser.json());
// app.morgan('tiny');
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: URL_ENCODE }));
app.use(helmet());
// Middleware to parse incoming request bodies
app.use(express.static('public'));
app.use(fileUpload()); // Enable file uploads
// Rate limiting
const limiter = rateLimit({ windowMs: REQUEST_TIME, max: REQUEST_NUMBER });
app.use(limiter);

// Cache
app.set('etag', WEB_CACHE);

// Routes
app.get('/', (req, res) => {
  res.send('Hello from WinkApp!');
});
app.use('/api', router);

// Error handling
app.use(NotFoundError);
app.use(DefaultErrorHandler);

// Serve static files for the frontend
app.use(express.static('client/dist'));
app.get('*', (req, res) => {
  res.sendFile(path.resolve('client', 'dist', 'index.html'));
});

export default app; 
