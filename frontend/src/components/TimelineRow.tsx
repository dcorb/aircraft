import React from 'react';
import { Plane, Wrench } from 'lucide-react';
import type { TimelineRowProps } from '../types/timeline';
import { TIMELINE_CONSTANTS } from '../constants';
import { getTimelineStartTime } from '../utils/timeline';
import { assignWorkPackageLevels } from '../utils/intervalScheduling';

function getBlockPosition(
  start: string,
  end: string,
  timelineStart: number,
  maxTime: number,
) {
  // Convert time differences to pixels relative to timeline start (00:00 of first day)
  const startOffsetMs = Date.parse(start) - timelineStart;

  // Cap the end time at our window boundary
  const originalEndMs = Date.parse(end);
  const cappedEndMs = Math.min(originalEndMs, maxTime);
  const durationMs = cappedEndMs - Date.parse(start);

  const startOffsetHours =
    startOffsetMs / TIMELINE_CONSTANTS.MILLISECONDS_PER_HOUR;
  const durationHours = durationMs / TIMELINE_CONSTANTS.MILLISECONDS_PER_HOUR;

  const leftPx = startOffsetHours * TIMELINE_CONSTANTS.PIXELS_PER_HOUR;
  const widthPx = durationHours * TIMELINE_CONSTANTS.PIXELS_PER_HOUR;

  return { left: `${leftPx}px`, width: `${widthPx}px` };
}

// Get styling for work package based on status
function getWorkPackageStyle(status: string) {
  const styles = {
    COMPLETED: {
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      statusBg: 'bg-emerald-300',
      statusText: 'text-white',
    },
    IN_PROGRESS: {
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200',
      statusBg: 'bg-sky-300',
      statusText: 'text-white',
    },
    SCHEDULED: {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      statusBg: 'bg-amber-300',
      statusText: 'text-white',
    },
    ON_HOLD: {
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      statusBg: 'bg-orange-300',
      statusText: 'text-white',
    },
    PENDING: {
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-200',
      statusBg: 'bg-slate-300',
      statusText: 'text-white',
    },
    CANCELLED: {
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      statusBg: 'bg-rose-300',
      statusText: 'text-white',
    },
  };

  return styles[status as keyof typeof styles] || styles.PENDING;
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  flights,
  workPackages,
  minTime,
  maxTime,
  timelineWidth,
  rowHeight,
}) => {
  // Calculate timeline start (00:00 UTC of first day)
  const timelineStart = getTimelineStartTime(minTime);

  // Assign levels to work packages to avoid overlaps
  const scheduledWorkPackages = assignWorkPackageLevels(workPackages);

  // Constants for positioning
  const FLIGHT_HEIGHT = 28;
  const WORK_PACKAGE_HEIGHT = 24;
  const LEVEL_SPACING = 28; // Vertical space between levels
  const TOP_PADDING = 8;

  return (
    <div
      className="relative border-b border-r border-gray-200 last:border-b-0 bg-white"
      style={{
        width: `${timelineWidth}px`,
        height: `${rowHeight}px`,
        boxSizing: 'border-box',
      }}
    >
      {/* Flights */}
      {flights.map((flight) => {
        const pos = getBlockPosition(
          flight.schedDepTime,
          flight.schedArrTime,
          timelineStart,
          maxTime,
        );
        return (
          <div
            key={flight.flightId}
            className="absolute bg-indigo-100 text-indigo-800 text-xs rounded-lg shadow-sm flex items-center px-3 gap-1.5 border border-indigo-200 select-none font-medium"
            style={{
              ...pos,
              top: `${TOP_PADDING}px`,
              height: `${FLIGHT_HEIGHT}px`,
            }}
            title={`Flight ${flight.flightNum}: ${flight.schedDepStation} → ${flight.schedArrStation}`}
          >
            <Plane className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate min-w-0">
              {flight.schedDepStation}—{flight.flightNum}—
              {flight.schedArrStation}
            </span>
          </div>
        );
      })}

      {/* Work Packages */}
      {scheduledWorkPackages.map((wp) => {
        const pos = getBlockPosition(
          wp.startDateTime,
          wp.endDateTime,
          timelineStart,
          maxTime,
        );

        // Calculate vertical position based on level
        // Start work packages below flights (if any) with proper spacing
        const flightSpace =
          flights.length > 0 ? FLIGHT_HEIGHT + TOP_PADDING : 0;
        const topPosition =
          flightSpace + TOP_PADDING + wp.level * LEVEL_SPACING;

        // Get status-based styling
        const style = getWorkPackageStyle(wp.status);

        // Simulate work order count (random 1-5)
        const workOrderCount = Math.floor(Math.random() * 5) + 1;

        return (
          <div
            key={wp.workPackageId}
            className={`absolute ${style.bgColor} ${style.textColor} text-xs rounded shadow flex items-center px-2 gap-1 border ${style.borderColor} select-none`}
            style={{
              ...pos,
              top: `${topPosition}px`,
              height: `${WORK_PACKAGE_HEIGHT}px`,
            }}
            title={`Work Package: ${wp.name} (Level ${wp.level + 1}) - Status: ${wp.status}`}
          >
            <Wrench className="w-3 h-3 flex-shrink-0" />
            <span className="truncate flex items-center gap-1 min-w-0">
              {wp.name}
              <span
                className={`inline-block px-1.5 py-0.5 rounded-full ${style.statusBg} ${style.statusText} font-medium leading-none flex-shrink-0`}
                style={{ fontSize: '10px' }}
              >
                {wp.status}
              </span>
              <span className="text-xs opacity-70 flex-shrink-0">
                {workOrderCount} WO
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineRow;
