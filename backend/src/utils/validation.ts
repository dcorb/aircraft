import type { TimeRangeQuery } from '../models/types';

/**
 * Validates if a string is a valid ISO 8601 date
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !isNaN(date.getTime()) &&
    dateString === date.toISOString()
  );
}

/**
 * Validates time range query parameters
 */
export function validateTimeRangeQuery(query: unknown): {
  isValid: boolean;
  error?: string;
  data?: TimeRangeQuery;
} {
  if (!query || typeof query !== 'object') {
    return {
      isValid: false,
      error: 'Query parameters are required',
    };
  }

  const { startTime, endTime } = query as Record<string, unknown>;

  // Check if parameters exist
  if (!startTime || !endTime) {
    return {
      isValid: false,
      error:
        'Both startTime and endTime parameters are required. Format: ISO 8601 (e.g., 2024-04-16T00:00:00.000Z)',
    };
  }

  // Check if parameters are strings
  if (typeof startTime !== 'string' || typeof endTime !== 'string') {
    return {
      isValid: false,
      error: 'startTime and endTime must be strings in ISO 8601 format',
    };
  }

  // Validate ISO date format
  if (!isValidISODate(startTime) || !isValidISODate(endTime)) {
    return {
      isValid: false,
      error:
        'Invalid date format. Use ISO 8601 format (e.g., 2024-04-16T00:00:00.000Z)',
    };
  }

  // Check time order
  if (new Date(startTime) >= new Date(endTime)) {
    return {
      isValid: false,
      error: 'startTime must be before endTime',
    };
  }

  return {
    isValid: true,
    data: { startTime, endTime },
  };
}
