import React from 'react';
import { Plane, Wrench } from 'lucide-react';
import type { TimelineRowProps } from '../types/timeline';
import { TIMELINE_CONSTANTS } from '../constants';
import { getTimelineStartTime } from '../utils/timeline';

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
            className="absolute top-2 h-5 bg-blue-100 text-blue-800 text-xs rounded shadow flex items-center px-2 gap-1 border border-blue-200 select-none"
            style={{ ...pos }}
            title={`Flight ${flight.flightNum}: ${flight.schedDepStation} → ${flight.schedArrStation}`}
          >
            <Plane className="w-3 h-3" />
            <span className="truncate">
              {flight.schedDepStation}—{flight.flightNum}—
              {flight.schedArrStation}
            </span>
          </div>
        );
      })}
      {/* Work Packages */}
      {workPackages.map((wp) => {
        const pos = getBlockPosition(
          wp.startDateTime,
          wp.endDateTime,
          timelineStart,
          maxTime,
        );
        // Simulate work order count (random 1-5)
        const workOrderCount = Math.floor(Math.random() * 5) + 1;
        return (
          <div
            key={wp.workPackageId}
            className="absolute top-8 h-6 bg-green-100 text-green-800 text-xs rounded shadow flex items-center px-2 gap-1 border border-green-200 select-none"
            style={{ ...pos }}
            title={`Work Package: ${wp.name}`}
          >
            <Wrench className="w-3 h-3" />
            <span className="truncate">
              {wp.name} | {wp.status} | {workOrderCount} WO
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineRow;
