import express from 'express';
import cors from 'cors';
import { db } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.json());

// Helper function to validate ISO date strings
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !isNaN(date.getTime()) &&
    dateString === date.toISOString()
  );
}

// Flights endpoint with time range filtering
app.get('/api/flights', (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    // Validate time parameters
    if (!startTime || !endTime) {
      return res.status(400).json({
        error:
          'Both startTime and endTime parameters are required. Format: ISO 8601 (e.g., 2024-04-16T00:00:00.000Z)',
      });
    }

    if (typeof startTime !== 'string' || typeof endTime !== 'string') {
      return res.status(400).json({
        error: 'startTime and endTime must be strings in ISO 8601 format',
      });
    }

    if (!isValidISODate(startTime) || !isValidISODate(endTime)) {
      return res.status(400).json({
        error:
          'Invalid date format. Use ISO 8601 format (e.g., 2024-04-16T00:00:00.000Z)',
      });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        error: 'startTime must be before endTime',
      });
    }

    // Query flights within the time range using scheduled departure time
    const flights = db
      .prepare(
        `
      SELECT * FROM flights 
      WHERE datetime(schedDepTime) >= datetime(?) AND datetime(schedDepTime) < datetime(?)
      ORDER BY schedDepTime ASC
    `,
      )
      .all(startTime, endTime);

    res.json({
      flights,
      timeRange: {
        startTime,
        endTime,
      },
      count: flights.length,
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// Work packages endpoint with time range filtering
app.get('/api/work-packages', (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    // Validate time parameters
    if (!startTime || !endTime) {
      return res.status(400).json({
        error:
          'Both startTime and endTime parameters are required. Format: ISO 8601 (e.g., 2024-04-16T00:00:00.000Z)',
      });
    }

    if (typeof startTime !== 'string' || typeof endTime !== 'string') {
      return res.status(400).json({
        error: 'startTime and endTime must be strings in ISO 8601 format',
      });
    }

    if (!isValidISODate(startTime) || !isValidISODate(endTime)) {
      return res.status(400).json({
        error:
          'Invalid date format. Use ISO 8601 format (e.g., 2024-04-16T00:00:00.000Z)',
      });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        error: 'startTime must be before endTime',
      });
    }

    // Query work packages where they overlap with the time range
    // A work package overlaps if: startTime < workPackage.endDateTime AND endTime > workPackage.startDateTime
    const workPackages = db
      .prepare(
        `
      SELECT * FROM workPackages 
      WHERE datetime(startDateTime) < datetime(?) AND datetime(endDateTime) > datetime(?)
      ORDER BY startDateTime ASC
    `,
      )
      .all(endTime, startTime);

    res.json({
      workPackages,
      timeRange: {
        startTime,
        endTime,
      },
      count: workPackages.length,
    });
  } catch (error) {
    console.error('Error fetching work packages:', error);
    res.status(500).json({ error: 'Failed to fetch work packages' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
