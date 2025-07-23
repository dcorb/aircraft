import React, { useEffect, useState } from 'react';
import TimelineHeader from './TimelineHeader';
import TimelineRow from './TimelineRow';
import type { Flight, WorkPackage } from '../types/timeline';
import { TIMELINE_CONSTANTS, getRowHeight } from '../constants';
import { getTimelineRange, getTimelineWidth } from '../utils/timeline';

const Timeline: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const flightsUrl = apiUrl ? `${apiUrl}/api/flights` : '/api/flights';
    const workPackagesUrl = apiUrl
      ? `${apiUrl}/api/work-packages`
      : '/api/work-packages';

    Promise.all([
      fetch(flightsUrl).then((res) => res.json()),
      fetch(workPackagesUrl).then((res) => res.json()),
    ])
      .then(([flightsData, workPackagesData]) => {
        setFlights(flightsData);
        setWorkPackages(workPackagesData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading timeline...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  // Group flights and work packages by registration
  const registrations = Array.from(
    new Set([
      ...flights.map((f) => f.registration),
      ...workPackages.map((wp) => wp.registration),
    ]),
  ).sort();

  const { min, max } = getTimelineRange(flights, workPackages);
  const timelineWidth = getTimelineWidth(min, max);

  // Calculate row heights (can be made dynamic based on content in the future)
  const rowHeights = registrations.map((_, index) => getRowHeight(index));

  return (
    <div className="w-full flex flex-col">
      {/* Scrollable Timeline Body */}
      <div className="flex overflow-hidden">
        {/* Sticky Aircraft List */}
        <div className="min-w-[120px] border-r bg-gray-50 flex flex-col">
          {/* Aircraft Label - matches timeline header height */}
          <div
            className="bg-gray-100 border-b flex items-center justify-center font-semibold text-gray-700"
            style={{
              height: `${TIMELINE_CONSTANTS.HEADER_HEIGHT}px`,
              boxSizing: 'border-box',
            }}
          >
            Planner
          </div>

          {/* Aircraft Registrations - match timeline row heights exactly */}
          {registrations.map((reg, index) => (
            <div
              key={reg}
              className="flex items-center justify-end pr-4 font-mono font-bold text-gray-700 border-b last:border-b-0 bg-white"
              style={{
                height: `${rowHeights[index]}px`,
                boxSizing: 'border-box',
              }}
            >
              {reg}
            </div>
          ))}
        </div>

        {/* Scrollable Timeline Content */}
        <div className="flex-1 overflow-auto">
          <div style={{ minWidth: `${timelineWidth}px` }}>
            {/* Timeline Header */}
            <div className="bg-white">
              <TimelineHeader
                flights={flights}
                workPackages={workPackages}
                timelineWidth={timelineWidth}
              />
            </div>

            {/* Timeline Rows */}
            {registrations.map((reg, index) => (
              <TimelineRow
                key={reg}
                flights={flights.filter((f) => f.registration === reg)}
                workPackages={workPackages.filter(
                  (wp) => wp.registration === reg,
                )}
                minTime={min}
                maxTime={max}
                timelineWidth={timelineWidth}
                rowHeight={rowHeights[index]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
