export interface Boundaries {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  region: string;
  regionName?: string;
  origin?: string;
  description?: string;
  boundaries?: Boundaries;
  neighbors?: string[];
  landmarks?: string[];
  coordinates: [number, number][][]; // [lng, lat][]
  center: [number, number]; // [lng, lat]
}

export interface SubwayStation {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  lines: string[]; // e.g. ['1', '2', '3']
  region?: 'manhattan' | 'brooklyn' | 'queens' | 'nj';
}

export interface SubwayRoute {
  totalMinutes: number;
  transitType: 'subway' | 'walk';
  summary: string; // e.g. "14-min ride on the 1 train"
  lineBullet: string; // e.g. "1", "A", "4", "Walk"
  lineColor: string; // e.g. "#EE352E"
  walkingStartCoords?: [number, number][];
  subwayCoords: [number, number][];
  walkingEndCoords?: [number, number][];
  boardStationName?: string;
  alightStationName?: string;
  transferStationName?: string;
}

export interface RoundResult {
  target: Neighborhood;
  tapped: Neighborhood | null;
  clickedPoint: [number, number];
  isCorrect: boolean;
  subwayRoute?: SubwayRoute;
}
