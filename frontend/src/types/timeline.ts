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

export interface TimelineRange {
  min: number;
  max: number;
}

export interface TimelineHeaderProps {
  flights: Flight[];
  workPackages: WorkPackage[];
  timelineWidth: number;
}

export interface TimelineRowProps {
  flights: Flight[];
  workPackages: WorkPackage[];
  minTime: number;
  maxTime: number;
  timelineWidth: number;
  rowHeight: number;
}
