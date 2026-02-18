import express from 'express';
import cors from 'cors';

import tripsRoutes from './routes/trips.routes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express(); //מייצג את השרת
app.use((req, res, next) => {
  console.log('INCOMING:', req.method, req.url);
  next();
});

app.use(cors()); //מאפשר גישה לשרת
app.use(express.json()); // מאפשר לשרת לקרוא מידע בפורמט JSON

app.get('/', (req, res) => res.send('the server is working!'));

app.use('/trips', tripsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
