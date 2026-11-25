import express from 'express';
import cors from 'cors';

import aiRoutes from "./routes/ai.routes.js";
import tripsRoutes from './routes/trips.routes.js';

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

const productionOrigin = 'https://travel-planner-app-taupe-beta.vercel.app';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? productionOrigin
    : [productionOrigin, 'http://localhost:5173'],
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('the server is working!');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/trips', tripsRoutes);
app.use('/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;