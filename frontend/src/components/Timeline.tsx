import React, { useEffect, useState, useCallback } from 'react';
import TimelineHeader from './TimelineHeader';
import TimelineRow from './TimelineRow';
import type { Flight, WorkPackage } from '../types/timeline';
import { TIMELINE_CONSTANTS, getRowHeight } from '../constants';
import { getTimelineWidth } from '../utils/timeline';

// Helper functions for date management

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDateForAPI(date: Date): string {
  return date.toISOString();
}

const Timeline: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const WINDOW_DAYS = 3;

  // Time range state - accumulate data as user navigates
  const [currentStartDate, setCurrentStartDate] = useState<Date>(
    () => new Date(Date.UTC(2024, 3, 15, 0, 0, 0, 0)), // April 15, 2024
  );
  const [dataStartDate, setDataStartDate] = useState<Date | null>(null);
  const [dataEndDate, setDataEndDate] = useState<Date | null>(null);

  const fetchData = useCallback(
    async (startDate: Date) => {
      const endDate = addDays(startDate, WINDOW_DAYS);

      // Check if we need to fetch new data (always fetch if no data yet)
      const needsNewData =
        !dataStartDate ||
        !dataEndDate ||
        startDate < dataStartDate ||
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
          !dataStartDate || startDate < dataStartDate
            ? startDate
            : dataStartDate;
        const newDataEnd =
          !dataEndDate || endDate > dataEndDate ? endDate : dataEndDate;

        const startTime = formatDateForAPI(newDataStart);
        const endTime = formatDateForAPI(newDataEnd);

        console.log('Fetching data for expanded range:', {
          startTime,
          endTime,
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

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentStartDate((prev) => {
      const newDate = addDays(prev, -1); // Move 1 day back
      console.log('Previous clicked:', {
        prev: prev.toISOString(),
        new: newDate.toISOString(),
      });
      return newDate;
    });
  };

  const goToNext = () => {
    setCurrentStartDate((prev) => {
      const newDate = addDays(prev, 1); // Move 1 day forward
      console.log('Next clicked:', {
        prev: prev.toISOString(),
        new: newDate.toISOString(),
      });
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date(Date.UTC(2024, 3, 15, 0, 0, 0, 0)); // April 15, 2024 (where we have data)
    console.log('Today clicked:', today.toISOString());
    setCurrentStartDate(today);
  };

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

  // Calculate row heights (can be made dynamic based on content in the future)
  const rowHeights = registrations.map((_, index) => getRowHeight(index));

  // Format date range for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday =
    currentStartDate.getTime() ===
    new Date(Date.UTC(2024, 3, 15, 0, 0, 0, 0)).getTime();

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
              onClick={goToToday}
              disabled={isToday}
              className={`px-4 py-2 text-sm rounded border transition-colors ${
                isToday
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Today
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
        <div className="flex-1 overflow-auto">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
