import { db } from '../database';
import type {
  WorkPackage,
  WorkPackageResponse,
  TimeRangeQuery,
} from '../models/types';

export class WorkPackageService {
  static async getWorkPackagesByTimeRange(
    timeRange: TimeRangeQuery,
  ): Promise<WorkPackageResponse> {
    const { startTime, endTime } = timeRange;

    try {
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
        .all(endTime, startTime) as WorkPackage[];

      return {
        workPackages,
        timeRange,
        count: workPackages.length,
      };
    } catch (error) {
      console.error('Error fetching work packages:', error);
      throw new Error('Failed to fetch work packages from database');
    }
  }
}
