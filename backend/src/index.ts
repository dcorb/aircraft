import express from 'express';
import cors from 'cors';
import { db } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.json());

// Flights endpoint
app.get('/api/flights', (_req, res) => {
  try {
    const flights = db.prepare('SELECT * FROM flights').all();
    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// Work packages endpoint
app.get('/api/work-packages', (_req, res) => {
  try {
    const workPackages = db.prepare('SELECT * FROM workPackages').all();
    res.json(workPackages);
  } catch (error) {
    console.error('Error fetching work packages:', error);
    res.status(500).json({ error: 'Failed to fetch work packages' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
