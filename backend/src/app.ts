import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes';

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

export { app };
