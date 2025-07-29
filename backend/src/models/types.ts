export interface Flight {
  flightId: string;
  airline: string;
  registration: string;
  aircraftType: string;
  flightNum: string;
  schedDepTime: string;
  schedArrTime: string;
  actualDepTime?: string;
  actualArrTime?: string;
  estimatedDepTime?: string;
  estimatedArrTime?: string;
  schedDepStation: string;
  schedArrStation: string;
  depStand?: string;
  origDepStand?: string;
  arrStand?: string;
  origArrStand?: string;
}

export interface WorkPackage {
  workPackageId: string;
  name: string;
  station: string;
  status: string;
  area: string;
  registration: string;
  startDateTime: string;
  endDateTime: string;
}

export interface TimeRangeQuery {
  startTime: string;
  endTime: string;
}

export interface FlightResponse {
  flights: Flight[];
  timeRange: TimeRangeQuery;
  count: number;
}

export interface WorkPackageResponse {
  workPackages: WorkPackage[];
  timeRange: TimeRangeQuery;
  count: number;
}

export interface ApiError {
  error: string;
}
