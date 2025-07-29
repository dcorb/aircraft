import { db } from '../database';
import type { Flight, FlightResponse, TimeRangeQuery } from '../models/types';

export class FlightService {
  static async getFlightsByTimeRange(
    timeRange: TimeRangeQuery,
  ): Promise<FlightResponse> {
    const { startTime, endTime } = timeRange;

    try {
      // Query flights within the time range using scheduled departure time
      const flights = db
        .prepare(
          `
        SELECT * FROM flights 
        WHERE datetime(schedDepTime) < datetime(?) AND datetime(schedArrTime) > datetime(?)
        ORDER BY schedDepTime ASC
      `,
        )
        .all(endTime, startTime) as Flight[];

      return {
        flights,
        timeRange,
        count: flights.length,
      };
    } catch (error) {
      console.error('Error fetching flights:', error);
      throw new Error('Failed to fetch flights from database');
    }
  }
}
