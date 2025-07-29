import React, { useEffect, useState, useCallback, useRef } from 'react';
import TimelineHeader from './TimelineHeader';
import TimelineRow from './TimelineRow';
import type { Flight, WorkPackage } from '../types/timeline';
import { TIMELINE_CONSTANTS, DEMO_CURRENT_TIME } from '../constants';
import { getTimelineWidth } from '../utils/timeline';
import { calculateRowHeight } from '../utils/intervalScheduling';

// Helper functions for date management

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDateForAPI(date: Date): string {
  return date.toISOString();
}

// Utility function to get mid-morning time (9:00 AM) of a specific date
function getMidMorningTime(date: Date): number {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      9, // 9:00 AM
      0,
      0,
      0,
    ),
  ).getTime();
}

// Utility function to get the start of day (00:00 UTC)
function getDayStart(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

// Utility function to calculate visual timeline start (00:00 of first day)
function getVisualTimelineStart(timelineMin: number): number {
  const firstDay = new Date(timelineMin);
  return getDayStart(firstDay).getTime();
}

// Utility function to calculate time position in pixels
function getTimePosition(
  targetTime: number,
  visualTimelineStart: number,
): number {
  const offsetMs = targetTime - visualTimelineStart;
  const offsetHours = offsetMs / TIMELINE_CONSTANTS.MILLISECONDS_PER_HOUR;
  return offsetHours * TIMELINE_CONSTANTS.PIXELS_PER_HOUR;
}

const Timeline: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ref for the scrollable timeline container
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Flag to control when auto-scroll should happen
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true); // Auto-scroll on initial load

  // Ref to immediately track manual navigation (prevents race conditions)
  const isManualNavigation = useRef(false);

  const WINDOW_DAYS = 3;

  // Time range state - accumulate data as user navigates
  const [currentStartDate, setCurrentStartDate] = useState<Date>(
    () => getDayStart(new Date(DEMO_CURRENT_TIME)), // Load at start of demo current day
  );
  const [dataStartDate, setDataStartDate] = useState<Date | null>(null);
  const [dataEndDate, setDataEndDate] = useState<Date | null>(null);

  const fetchData = useCallback(
    async (startDate: Date) => {
      // Always fetch from the start of the day (00:00) to include early morning data
      const dayStartDate = getDayStart(startDate);
      const endDate = addDays(dayStartDate, WINDOW_DAYS);

      // Check if we need to fetch new data (always fetch if no data yet)
      const needsNewData =
        !dataStartDate ||
        !dataEndDate ||
        dayStartDate < dataStartDate ||
        endDate > dataEndDate;

      if (!needsNewData) {
        setLoading(false);
        return;
      }

      // Only show loading spinner on initial load, not when expanding data
      const isInitialLoad = !dataStartDate || !dataEndDate;
      if (isInitialLoad) {
        setLoading(true);
      }
      setError('');

      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const baseUrl = apiUrl || '';

        // Expand our data range to include the new area
        const newDataStart =
          !dataStartDate || dayStartDate < dataStartDate
            ? dayStartDate
            : dataStartDate;
        const newDataEnd =
          !dataEndDate || endDate > dataEndDate ? endDate : dataEndDate;

        const startTime = formatDateForAPI(newDataStart);
        const endTime = formatDateForAPI(newDataEnd);

        console.log('Fetching data for expanded range:', {
          startTime,
          endTime,
          originalStartDate: startDate.toISOString(),
          dayStartDate: dayStartDate.toISOString(),
        });

        const flightsUrl = `${baseUrl}/api/flights?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
        const workPackagesUrl = `${baseUrl}/api/work-packages?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

        const [flightsResponse, workPackagesResponse] = await Promise.all([
          fetch(flightsUrl),
          fetch(workPackagesUrl),
        ]);

        if (!flightsResponse.ok) {
          const flightsError = await flightsResponse.json();
          throw new Error(
            flightsError.error ||
              `Failed to fetch flights: ${flightsResponse.status}`,
          );
        }

        if (!workPackagesResponse.ok) {
          const workPackagesError = await workPackagesResponse.json();
          throw new Error(
            workPackagesError.error ||
              `Failed to fetch work packages: ${workPackagesResponse.status}`,
          );
        }

        const flightsData = await flightsResponse.json();
        const workPackagesData = await workPackagesResponse.json();

        console.log('API Response:', {
          flightCount: (flightsData.flights || flightsData).length,
          workPackageCount: (workPackagesData.workPackages || workPackagesData)
            .length,
        });

        // Replace with the complete dataset for the expanded range
        setFlights(flightsData.flights || flightsData);
        setWorkPackages(workPackagesData.workPackages || workPackagesData);

        // Update our data boundaries
        setDataStartDate(newDataStart);
        setDataEndDate(newDataEnd);

        // Always clear loading state after successful fetch
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Always clear loading state on error
        setLoading(false);
      }
    },
    [WINDOW_DAYS, dataStartDate, dataEndDate],
  );

  // Load data when date range changes
  useEffect(() => {
    fetchData(currentStartDate);
  }, [currentStartDate, fetchData]);

  // Group flights and work packages by registration - keep stable order
  const registrations = React.useMemo(() => {
    return Array.from(
      new Set([
        ...flights.map((f) => f.registration),
        ...workPackages.map((wp) => wp.registration),
      ]),
    ).sort();
  }, [flights, workPackages]);

  // Function to scroll to center the current time
  const scrollToCurrentTime = useCallback(() => {
    if (!timelineScrollRef.current) return;

    const container = timelineScrollRef.current;
    const containerWidth = container.clientWidth;

    // Calculate current time position
    const currentTimeMs = DEMO_CURRENT_TIME.getTime();
    const timelineMin = dataStartDate?.getTime() ?? currentStartDate.getTime();
    const timelineMax =
      (dataEndDate?.getTime() ??
        addDays(currentStartDate, WINDOW_DAYS).getTime()) - 1;

    const isCurrentTimeVisible =
      currentTimeMs >= timelineMin && currentTimeMs <= timelineMax;

    if (isCurrentTimeVisible) {
      const visualTimelineStart = getVisualTimelineStart(timelineMin);
      const currentTimePosition = getTimePosition(
        currentTimeMs,
        visualTimelineStart,
      );

      // Calculate scroll position to center the current time
      const scrollLeft = Math.max(0, currentTimePosition - containerWidth / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [currentStartDate, dataStartDate, dataEndDate, WINDOW_DAYS]);

  // Function to scroll to a specific date
  const scrollToDate = useCallback(
    (targetDate: Date) => {
      if (!timelineScrollRef.current) return;

      const container = timelineScrollRef.current;
      const timelineMin =
        dataStartDate?.getTime() ?? currentStartDate.getTime();

      const visualTimelineStart = getVisualTimelineStart(timelineMin);
      const targetTime = getMidMorningTime(targetDate);
      const targetPosition = getTimePosition(targetTime, visualTimelineStart);

      // Center the target time in the viewport
      const scrollLeft = Math.max(
        0,
        targetPosition - container.clientWidth / 2,
      );

      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    },
    [currentStartDate, dataStartDate, dataEndDate],
  );

  // Navigation handlers
  const goToPrevious = () => {
    isManualNavigation.current = true; // Immediately prevent auto-scroll
    setShouldAutoScroll(false); // Disable auto-scroll when navigating
    setCurrentStartDate((prev) => {
      // Move start date back by 1 day
      const newDate = addDays(prev, -1);
      console.log('Previous clicked:', {
        currentRange: `${formatDisplayDate(prev)} - ${formatDisplayDate(addDays(prev, WINDOW_DAYS - 1))}`,
        newRange: `${formatDisplayDate(newDate)} - ${formatDisplayDate(addDays(newDate, WINDOW_DAYS - 1))}`,
      });
      // Scroll to the new day that comes into view (the new start)
      setTimeout(() => {
        scrollToDate(newDate);
        isManualNavigation.current = false; // Reset after scroll completes
      }, 100);
      return newDate;
    });
  };

  const goToNext = () => {
    isManualNavigation.current = true; // Immediately prevent auto-scroll
    setShouldAutoScroll(false); // Disable auto-scroll when navigating
    setCurrentStartDate((prev) => {
      // Move start date forward by 1 day
      const newDate = addDays(prev, 1);
      const newEndDate = addDays(newDate, WINDOW_DAYS - 1); // The new day that comes into view
      console.log('Next clicked:', {
        currentRange: `${formatDisplayDate(prev)} - ${formatDisplayDate(addDays(prev, WINDOW_DAYS - 1))}`,
        newRange: `${formatDisplayDate(newDate)} - ${formatDisplayDate(newEndDate)}`,
        scrollingTo: formatDisplayDate(newEndDate),
      });
      // Scroll to the new day that comes into view (the new end)
      setTimeout(() => {
        scrollToDate(newEndDate);
        isManualNavigation.current = false; // Reset after scroll completes
      }, 100);
      return newDate;
    });
  };

  const goToNow = () => {
    console.log('Now clicked:', DEMO_CURRENT_TIME.toISOString());
    isManualNavigation.current = false; // Allow auto-scroll for Now button
    setShouldAutoScroll(true); // Enable auto-scroll for Now button
    setCurrentStartDate(getDayStart(new Date(DEMO_CURRENT_TIME))); // Set to start of current day
    // Scroll to current time after state update
    setTimeout(() => scrollToCurrentTime(), 100);
  };

  // Auto-scroll to current time when data loads and we're showing the current time
  useEffect(() => {
    if (
      !loading &&
      dataStartDate &&
      dataEndDate &&
      shouldAutoScroll &&
      !isManualNavigation.current
    ) {
      const currentTimeMs = DEMO_CURRENT_TIME.getTime();
      const isShowingCurrentTime =
        currentTimeMs >= dataStartDate.getTime() &&
        currentTimeMs <= dataEndDate.getTime();

      if (isShowingCurrentTime) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          scrollToCurrentTime();
          setShouldAutoScroll(false); // Reset flag after auto-scroll
        }, 100);
      }
    }
  }, [
    loading,
    dataStartDate,
    dataEndDate,
    shouldAutoScroll,
    scrollToCurrentTime,
  ]);

  // Calculate row heights dynamically based on content
  const rowHeights = React.useMemo(() => {
    return registrations.map((registration) => {
      const aircraftFlights = flights.filter(
        (f) => f.registration === registration,
      );
      const aircraftWorkPackages = workPackages.filter(
        (wp) => wp.registration === registration,
      );

      return calculateRowHeight(aircraftFlights, aircraftWorkPackages);
    });
  }, [registrations, flights, workPackages]);

  if (loading)
    return <div className="p-8 text-center">Loading timeline...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  // Timeline and header both show accumulated data range
  const timelineMin = dataStartDate?.getTime() ?? currentStartDate.getTime();
  const timelineMax =
    (dataEndDate?.getTime() ??
      addDays(currentStartDate, WINDOW_DAYS).getTime()) - 1;
  const timelineWidth = getTimelineWidth(timelineMin, timelineMax);

  // Calculate current time line position
  const currentTimeMs = DEMO_CURRENT_TIME.getTime();
  const isCurrentTimeVisible =
    currentTimeMs >= timelineMin && currentTimeMs <= timelineMax;

  let currentTimePosition = 0;
  if (isCurrentTimeVisible) {
    const visualTimelineStart = getVisualTimelineStart(timelineMin);
    currentTimePosition = getTimePosition(currentTimeMs, visualTimelineStart);
  }

  // Format date range for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Flight Timeline
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevious}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600 px-3 py-1 bg-gray-50 rounded">
                {formatDisplayDate(currentStartDate)} -{' '}
                {formatDisplayDate(addDays(currentStartDate, WINDOW_DAYS - 1))}
              </span>
              <button
                onClick={goToNext}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {flights.length} flights, {workPackages.length} work packages
            </span>
            <button
              onClick={goToNow}
              className="px-4 py-2 text-sm rounded border transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Now
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="bg-white border-r border-gray-200">
          <div
            className="bg-gray-100 border-b border-gray-200 flex items-center justify-center text-sm font-medium text-gray-700"
            style={{ height: TIMELINE_CONSTANTS.HEADER_HEIGHT }}
          >
            Aircraft
          </div>
          {registrations.map((registration, index) => (
            <div
              key={registration}
              className="border-b border-gray-200 bg-white flex items-center px-4 text-sm text-gray-700"
              style={{
                height: rowHeights[index],
                width: TIMELINE_CONSTANTS.SIDEBAR_WIDTH,
              }}
            >
              <span className="font-medium">{registration}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-auto" ref={timelineScrollRef}>
          <div className="relative min-w-full">
            <div
              style={{
                width: timelineWidth,
                height:
                  TIMELINE_CONSTANTS.HEADER_HEIGHT +
                  rowHeights.reduce((sum, height) => sum + height, 0),
              }}
            >
              <TimelineHeader
                timelineWidth={timelineWidth}
                min={timelineMin}
                max={timelineMax}
              />
              {registrations.map((registration, index) => {
                const aircraftFlights = flights.filter(
                  (f) => f.registration === registration,
                );
                const aircraftWorkPackages = workPackages.filter(
                  (wp) => wp.registration === registration,
                );

                return (
                  <TimelineRow
                    key={registration}
                    flights={aircraftFlights}
                    workPackages={aircraftWorkPackages}
                    minTime={timelineMin}
                    maxTime={timelineMax}
                    timelineWidth={timelineWidth}
                    rowHeight={rowHeights[index]}
                  />
                );
              })}

              {/* Current Time Indicator Line */}
              {isCurrentTimeVisible && (
                <div
                  className="absolute top-0 w-px bg-black z-10"
                  style={{
                    left: `${currentTimePosition}px`,
                    height: '100%',
                  }}
                  title={`Current Time: ${DEMO_CURRENT_TIME.toLocaleString(
                    'en-US',
                    {
                      timeZone: 'UTC',
                      dateStyle: 'short',
                      timeStyle: 'short',
                    },
                  )} UTC`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
