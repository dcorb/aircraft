import type { Flight, WorkPackage, TimelineRange } from '../types/timeline';
import { TIMELINE_CONSTANTS } from '../constants';

/**
 * Calculate the time range from flights and work packages
 */
export function getTimelineRange(
  flights: Flight[],
  workPackages: WorkPackage[],
): TimelineRange {
  const allTimes = [
    ...flights.flatMap((f) => [
      Date.parse(f.schedDepTime),
      Date.parse(f.schedArrTime),
    ]),
    ...workPackages.flatMap((wp) => [
      Date.parse(wp.startDateTime),
      Date.parse(wp.endDateTime),
    ]),
  ];
  const min = Math.min(...allTimes);
  const max = Math.max(...allTimes);
  return { min, max };
}

/**
 * Calculate timeline width based on time range
 */
export function getTimelineWidth(min: number, max: number): number {
  const totalHours = (max - min) / (60 * 60 * 1000);
  return Math.max(
    totalHours * TIMELINE_CONSTANTS.PIXELS_PER_HOUR,
    TIMELINE_CONSTANTS.MIN_TIMELINE_WIDTH,
  );
}

/**
 * Calculate timeline start time (00:00 UTC of first day)
 */
export function getTimelineStartTime(minTime: number): number {
  const firstDay = new Date(minTime);
  return new Date(
    Date.UTC(
      firstDay.getUTCFullYear(),
      firstDay.getUTCMonth(),
      firstDay.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  ).getTime();
}
