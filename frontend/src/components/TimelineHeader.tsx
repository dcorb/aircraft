import React from 'react';
import type { TimelineHeaderProps } from '../types/timeline';
import { TIMELINE_CONSTANTS } from '../constants';
import { getTimelineRange } from '../utils/timeline';

function getTicks(min: number, max: number) {
  // Start from 00:00 UTC of the first day in the range
  const firstDay = new Date(min);
  const startTime = new Date(
    Date.UTC(
      firstDay.getUTCFullYear(),
      firstDay.getUTCMonth(),
      firstDay.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  // End at the exact max time, but round up to the nearest hour in UTC
  const endTime = new Date(max);
  endTime.setUTCHours(endTime.getUTCHours() + 1, 0, 0, 0);

  const ticks = [];
  const current = new Date(startTime);

  while (current <= endTime) {
    // Calculate pixel position for each tick
    const offsetMs = current.getTime() - startTime.getTime();
    const offsetHours = offsetMs / TIMELINE_CONSTANTS.MILLISECONDS_PER_HOUR;
    const leftPx = offsetHours * TIMELINE_CONSTANTS.PIXELS_PER_HOUR;

    // Determine if this is an hour mark (show time label) or 30-min mark (just divider)
    const isHourMark = current.getUTCMinutes() === 0;

    ticks.push({
      time: new Date(current),
      leftPx,
      isHourMark,
    });

    // Increment by 30 minutes
    current.setUTCMinutes(
      current.getUTCMinutes() + TIMELINE_CONSTANTS.MINUTES_PER_TICK,
    );
  }

  return { ticks, timelineStart: startTime.getTime() };
}

function getDateGroups(ticks: { time: Date; leftPx: number }[]) {
  const dateGroups: {
    date: Date;
    hours: { time: Date; leftPx: number }[];
    startPx: number;
    widthPx: number;
  }[] = [];
  let currentDate: Date | null = null;
  let currentHours: { time: Date; leftPx: number }[] = [];

  ticks.forEach((tick) => {
    // Create date using UTC to avoid timezone shifts
    const tickDate = new Date(
      Date.UTC(
        tick.time.getUTCFullYear(),
        tick.time.getUTCMonth(),
        tick.time.getUTCDate(),
      ),
    );

    if (currentDate === null || tickDate.getTime() !== currentDate.getTime()) {
      if (currentDate !== null) {
        const startPx = currentHours[0].leftPx;
        const endPx = currentHours[currentHours.length - 1].leftPx + 100; // Last tick + 100px
        dateGroups.push({
          date: currentDate,
          hours: currentHours,
          startPx,
          widthPx: endPx - startPx,
        });
      }
      currentDate = tickDate;
      currentHours = [tick];
    } else {
      currentHours.push(tick);
    }
  });

  if (currentDate !== null) {
    const startPx = currentHours[0].leftPx;
    const endPx = currentHours[currentHours.length - 1].leftPx + 100; // Last tick + 100px
    dateGroups.push({
      date: currentDate,
      hours: currentHours,
      startPx,
      widthPx: endPx - startPx,
    });
  }

  return dateGroups;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  flights,
  workPackages,
  timelineWidth,
}) => {
  const { min, max } = getTimelineRange(flights, workPackages);
  const { ticks, timelineStart } = getTicks(min, max);
  const dateGroups = getDateGroups(ticks);

  return (
    <div
      className="flex flex-col relative bg-white border-b"
      style={{
        minWidth: `${timelineWidth}px`,
        height: `${TIMELINE_CONSTANTS.HEADER_HEIGHT}px`,
        boxSizing: 'border-box',
      }}
      data-timeline-start={timelineStart} // Pass timeline start to be used by TimelineRow
    >
      {/* Date display - multiple dates when spanning multiple days */}
      <div
        className="relative w-full border-b border-gray-200"
        style={{
          height: `${TIMELINE_CONSTANTS.DATE_ROW_HEIGHT}px`,
          boxSizing: 'border-box',
        }}
      >
        {dateGroups.map((group) => {
          const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          };
          const formattedDate = group.date.toLocaleDateString(
            'en-US',
            dateOptions,
          );

          return (
            <div
              key={group.date.toISOString()}
              className="absolute flex items-center justify-center py-2"
              style={{
                left: `${group.startPx}px`,
                width: `${group.widthPx}px`,
              }}
            >
              <div className="text-sm text-gray-600 font-medium">
                {formattedDate}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly ticks */}
      <div
        className="relative w-full"
        style={{
          height: `${TIMELINE_CONSTANTS.TIME_ROW_HEIGHT}px`,
          boxSizing: 'border-box',
        }}
      >
        {ticks.map((tick) => (
          <div
            key={tick.time.toISOString()}
            className="absolute bottom-0 flex flex-col py-2"
            style={{
              left: `${tick.leftPx}px`,
            }}
          >
            {/* Time label - only show for hour marks */}
            {tick.isHourMark && (
              <div className="text-xs text-gray-500 font-medium mb-1 -ml-[15px]">
                {tick.time.getUTCHours() +
                  ':' +
                  tick.time.getUTCMinutes().toString().padStart(2, '0')}
              </div>
            )}
            {/* Tick mark - different heights for hour vs 30-min marks */}
            <div
              className={`absolute bottom-0 w-px bg-teal-400 ${
                tick.isHourMark ? 'h-2' : 'h-1'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineHeader;
