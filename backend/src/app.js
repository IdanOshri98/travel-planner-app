import express from 'express';
import cors from 'cors';

import aiRoutes from "./routes/ai.routes.js";
import tripsRoutes from './routes/trips.routes.js';
import eventsRoutes from "./routes/events.routes.js";

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('the server is working!');
});

app.use('/trips', tripsRoutes);
app.use('/events', eventsRoutes);
app.use('/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;