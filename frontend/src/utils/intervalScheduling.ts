import type { WorkPackage } from '../types/timeline';

export interface ScheduledWorkPackage extends WorkPackage {
  level: number;
}

export interface TimeInterval {
  start: number;
  end: number;
  id: string;
  data: WorkPackage;
}

/**
 * Assign levels to work packages using a greedy interval scheduling algorithm
 * This is similar to graph coloring but optimized for time intervals
 */
export function assignWorkPackageLevels(
  workPackages: WorkPackage[],
): ScheduledWorkPackage[] {
  if (workPackages.length === 0) return [];

  // Convert work packages to time intervals
  const intervals: TimeInterval[] = workPackages.map((wp) => ({
    start: Date.parse(wp.startDateTime),
    end: Date.parse(wp.endDateTime),
    id: wp.workPackageId,
    data: wp,
  }));

  // Sort intervals by start time for optimal greedy assignment
  intervals.sort((a, b) => a.start - b.start);

  // Track the end time of the last interval assigned to each level
  const levelEndTimes: number[] = [];
  const result: ScheduledWorkPackage[] = [];

  for (const interval of intervals) {
    // Find the first level where this interval can fit
    let assignedLevel = -1;

    for (let level = 0; level < levelEndTimes.length; level++) {
      // If the current level's last interval ends before this one starts, we can use this level
      if (levelEndTimes[level] <= interval.start) {
        assignedLevel = level;
        break;
      }
    }

    // If no existing level works, create a new one
    if (assignedLevel === -1) {
      assignedLevel = levelEndTimes.length;
      levelEndTimes.push(0);
    }

    // Update the level's end time
    levelEndTimes[assignedLevel] = interval.end;

    // Add to result with assigned level
    result.push({
      ...interval.data,
      level: assignedLevel,
    });
  }

  return result;
}

/**
 * Calculate the number of levels needed for a set of work packages
 */
export function calculateRequiredLevels(workPackages: WorkPackage[]): number {
  if (workPackages.length === 0) return 0;

  const scheduled = assignWorkPackageLevels(workPackages);
  const maxLevel = Math.max(...scheduled.map((wp) => wp.level));
  const requiredLevels = maxLevel + 1;

  console.log(
    `calculateRequiredLevels: ${workPackages.length} packages, max level: ${maxLevel}, required levels: ${requiredLevels}`,
  );

  return requiredLevels;
}

/**
 * Calculate dynamic row height based on content
 */
export function calculateRowHeight(
  flights: { length: number },
  workPackages: WorkPackage[],
  levelHeight: number = 28,
): number {
  const workPackageLevels = calculateRequiredLevels(workPackages);
  const hasFlights = flights.length > 0;

  // Base height includes space for flights (if any) and work package levels
  const flightHeight = hasFlights ? 28 : 0; // Space for flight row
  const workPackageHeight = workPackageLevels * levelHeight; // Only add height for actual levels needed
  const minHeight = 45; // Minimum row height even with no content
  const padding = 16; // Top and bottom padding

  const calculatedHeight = Math.max(
    minHeight,
    flightHeight + workPackageHeight + padding,
  );

  console.log(
    `calculateRowHeight: flights=${flights.length}, workPackages=${workPackages.length}, levels=${workPackageLevels}, height=${calculatedHeight}`,
  );

  return calculatedHeight;
}
