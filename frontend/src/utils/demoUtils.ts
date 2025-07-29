import type { Flight, WorkPackage } from '../types/timeline';
import { DEMO_CURRENT_TIME } from '../constants';

/**
 * Generate demo work packages with realistic status distribution based on timeline
 */
export function generateDemoWorkPackages(
  flights: Flight[],
  workPackages: WorkPackage[],
  count: number = 100,
): WorkPackage[] {
  // First, get the actual registrations from loaded data
  const actualRegistrations = Array.from(
    new Set([
      ...flights.map((f) => f.registration),
      ...workPackages.map((wp) => wp.registration),
    ]),
  ).sort();

  // If no registrations available, use default ones
  const registrationsList =
    actualRegistrations.length > 0
      ? actualRegistrations
      : ['N123AB', 'N456CD', 'N789EF', 'N012GH', 'N345IJ'];

  const demoDate = new Date(2024, 3, 17); // April 17, 2024
  const currentTime = DEMO_CURRENT_TIME.getTime();
  const areas = ['ENGINE', 'AVIONICS', 'HYDRAULICS', 'ELECTRICAL', 'STRUCTURE'];
  const stations = ['SFO', 'LAX', 'JFK', 'ORD', 'DFW'];

  const demoWPs: WorkPackage[] = [];

  for (let i = 0; i < count; i++) {
    // Create overlapping time ranges throughout the day
    const startHour = Math.floor(Math.random() * 20); // 0-19 hours
    const duration = Math.random() * 8 + 1; // 1-9 hours duration

    const startDateTime = new Date(
      Date.UTC(
        demoDate.getFullYear(),
        demoDate.getMonth(),
        demoDate.getDate(),
        startHour,
        0,
        0,
      ),
    );
    const endDateTime = new Date(
      startDateTime.getTime() + duration * 60 * 60 * 1000,
    );

    // Distribute packages evenly across all available registrations
    const registrationIndex = i % registrationsList.length;

    demoWPs.push({
      workPackageId: `DEMO-WP-${i.toString().padStart(3, '0')}`,
      name: `Demo Work Package ${i + 1}`,
      station: stations[Math.floor(Math.random() * stations.length)],
      status: 'PENDING', // Will be assigned later based on timeline logic
      area: areas[Math.floor(Math.random() * areas.length)],
      registration: registrationsList[registrationIndex],
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    });
  }

  // Now assign statuses based on timeline logic
  assignRealisticStatuses(demoWPs, currentTime);

  return demoWPs;
}

/**
 * Assign realistic statuses to work packages based on their timeline relative to current time
 * 80% of work packages that ended before "now" should be completed
 */
function assignRealisticStatuses(
  workPackages: WorkPackage[],
  currentTime: number,
): void {
  // Separate work packages by time relationship to current time
  const pastWorkPackages: WorkPackage[] = [];
  const currentWorkPackages: WorkPackage[] = [];
  const futureWorkPackages: WorkPackage[] = [];

  workPackages.forEach((wp) => {
    const workPackageEndTime = Date.parse(wp.endDateTime);
    const workPackageStartTime = Date.parse(wp.startDateTime);

    if (workPackageEndTime < currentTime) {
      // Work package ended before current time
      pastWorkPackages.push(wp);
    } else if (
      workPackageStartTime <= currentTime &&
      workPackageEndTime >= currentTime
    ) {
      // Work package is currently active
      currentWorkPackages.push(wp);
    } else {
      // Work package starts in the future
      futureWorkPackages.push(wp);
    }
  });

  // Assign statuses to past work packages (80% completed, 20% cancelled)
  pastWorkPackages.forEach((wp, index) => {
    if (index < Math.floor(pastWorkPackages.length * 0.8)) {
      wp.status = 'COMPLETED';
    } else {
      wp.status = 'CANCELLED';
    }
  });

  // Assign statuses to current work packages (80% in progress, 20% on hold)
  currentWorkPackages.forEach((wp, index) => {
    if (index < Math.floor(currentWorkPackages.length * 0.8)) {
      wp.status = 'IN_PROGRESS';
    } else {
      wp.status = 'ON_HOLD';
    }
  });

  // Assign statuses to future work packages (90% scheduled, 10% pending)
  futureWorkPackages.forEach((wp, index) => {
    if (index < Math.floor(futureWorkPackages.length * 0.9)) {
      wp.status = 'SCHEDULED';
    } else {
      wp.status = 'PENDING';
    }
  });
}
