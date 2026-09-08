import { SubwayStation, SubwayRoute, Neighborhood } from '../types/game';
import {
  SUBWAY_STATIONS,
  SUBWAY_STATIONS_MAP,
  SUBWAY_EDGES,
  MTA_LINE_COLORS,
  SubwayEdge,
} from '../data/subwayNetwork';

// Haversine distance in miles
function getDistanceMiles(from: [number, number], to: [number, number]): number {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function normalizeRegion(region?: string): 'manhattan' | 'brooklyn' | 'queens' | 'nj' {
  if (!region) return 'manhattan';
  const r = region.toLowerCase();
  if (r.includes('brooklyn') || r === 'bk') return 'brooklyn';
  if (r.includes('queens') || r.includes('lic')) return 'queens';
  if (r.includes('nj') || r.includes('hoboken') || r.includes('jersey')) return 'nj';
  return 'manhattan';
}

export function detectRegionForPoint(point: [number, number]): 'manhattan' | 'brooklyn' | 'queens' | 'nj' {
  const [lng, lat] = point;
  // West of Hudson River -> NJ
  if (lng < -74.020) return 'nj';
  // Queens (LIC: north of Newtown Creek, east of East River)
  if (lng > -73.962 && lat >= 40.735) return 'queens';
  // Brooklyn (south of Newtown Creek, east of East River)
  if (lng > -73.985 && lat < 40.735) return 'brooklyn';
  if (lng > -74.015 && lat < 40.702) return 'brooklyn';
  return 'manhattan';
}

export function findNearestStation(
  point: [number, number],
  preferredRegion?: 'manhattan' | 'brooklyn' | 'queens' | 'nj'
): {
  station: SubwayStation;
  distMiles: number;
  walkMinutes: number;
} {
  const region = preferredRegion || detectRegionForPoint(point);
  const candidateStations = SUBWAY_STATIONS.filter(
    (s) => (s.region || 'manhattan') === region
  );
  const stationsToSearch = candidateStations.length > 0 ? candidateStations : SUBWAY_STATIONS;

  let nearest: SubwayStation = stationsToSearch[0];
  let minDistance = Infinity;

  for (const st of stationsToSearch) {
    const d = getDistanceMiles(point, st.coordinates);
    if (d < minDistance) {
      minDistance = d;
      nearest = st;
    }
  }

  const walkMinutes = Math.max(1, Math.round(minDistance * 20)); // ~20 min per mile (3 mph)
  return { station: nearest, distMiles: minDistance, walkMinutes };
}

interface DijkstraNode {
  stationId: string;
  totalTime: number;
  path: { stationId: string; line: string; color: string }[];
}

/**
 * Computes shortest subway route using Dijkstra's algorithm
 */
function solveSubwayDijkstra(
  startId: string,
  endId: string
): { pathStations: SubwayStation[]; linesUsed: string[]; totalSubwayTime: number } | null {
  if (startId === endId) {
    const st = SUBWAY_STATIONS_MAP.get(startId);
    return st ? { pathStations: [st], linesUsed: [], totalSubwayTime: 0 } : null;
  }

  // Build adjacency list
  const adj = new Map<string, SubwayEdge[]>();
  for (const edge of SUBWAY_EDGES) {
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    adj.get(edge.from)!.push(edge);
  }

  const visited = new Set<string>();
  const distances = new Map<string, number>();
  distances.set(startId, 0);

  // Simple priority queue using array
  const queue: DijkstraNode[] = [
    {
      stationId: startId,
      totalTime: 0,
      path: [{ stationId: startId, line: '', color: '' }],
    },
  ];

  while (queue.length > 0) {
    queue.sort((a, b) => a.totalTime - b.totalTime);
    const current = queue.shift()!;

    if (visited.has(current.stationId)) continue;
    visited.add(current.stationId);

    if (current.stationId === endId) {
      const pathStations = current.path
        .map((p) => SUBWAY_STATIONS_MAP.get(p.stationId)!)
        .filter(Boolean);
      const linesUsed = Array.from(
        new Set(
          current.path
            .map((p) => p.line)
            .filter((l) => l && l !== 'Transfer')
        )
      );
      return { pathStations, linesUsed, totalSubwayTime: current.totalTime };
    }

    const neighbors = adj.get(current.stationId) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const newTime = current.totalTime + edge.minutes;
      const prevBest = distances.get(edge.to) ?? Infinity;

      if (newTime < prevBest) {
        distances.set(edge.to, newTime);
        queue.push({
          stationId: edge.to,
          totalTime: newTime,
          path: [
            ...current.path,
            { stationId: edge.to, line: edge.line, color: edge.color },
          ],
        });
      }
    }
  }

  return null;
}

/**
 * Calculates the fastest subway (or walking) route from tapped point to target center
 */
export function calculateSubwayRoute(
  fromPoint: [number, number],
  toPoint: [number, number],
  targetNeighborhood: Neighborhood,
  tappedNeighborhood?: Neighborhood | null
): SubwayRoute {
  const directDistMiles = getDistanceMiles(fromPoint, toPoint);
  const fromRegion = tappedNeighborhood
    ? normalizeRegion(tappedNeighborhood.region)
    : detectRegionForPoint(fromPoint);
  const toRegion = normalizeRegion(targetNeighborhood.region);

  // If very close (< 0.45 miles / ~9 blocks) AND in the same landmass/region, walking directly is faster!
  if (fromRegion === toRegion && directDistMiles < 0.45) {
    const walkMins = Math.max(2, Math.round(directDistMiles * 20));
    return {
      totalMinutes: walkMins,
      transitType: 'walk',
      summary: `${walkMins}-min walk to ${targetNeighborhood.name}`,
      lineBullet: 'Walk',
      lineColor: '#94A3B8',
      subwayCoords: [fromPoint, toPoint],
    };
  }

  const startStationInfo = findNearestStation(fromPoint, fromRegion);
  const endStationInfo = findNearestStation(toPoint, toRegion);

  // If both map to the same station, walk directly (only if same region)
  if (startStationInfo.station.id === endStationInfo.station.id && fromRegion === toRegion) {
    const walkMins = Math.max(3, Math.round(directDistMiles * 20));
    return {
      totalMinutes: walkMins,
      transitType: 'walk',
      summary: `${walkMins}-min walk to ${targetNeighborhood.name}`,
      lineBullet: 'Walk',
      lineColor: '#94A3B8',
      subwayCoords: [fromPoint, toPoint],
    };
  }

  const dijkstraResult = solveSubwayDijkstra(
    startStationInfo.station.id,
    endStationInfo.station.id
  );

  if (!dijkstraResult || dijkstraResult.pathStations.length === 0) {
    // Fallback: direct walking
    const walkMins = Math.max(5, Math.round(directDistMiles * 20));
    return {
      totalMinutes: walkMins,
      transitType: 'walk',
      summary: `${walkMins}-min walk to ${targetNeighborhood.name}`,
      lineBullet: 'Walk',
      lineColor: '#94A3B8',
      subwayCoords: [fromPoint, toPoint],
    };
  }

  const { pathStations, linesUsed, totalSubwayTime } = dijkstraResult;
  const primaryLine = linesUsed[0] || '1';
  const lineColor = MTA_LINE_COLORS[primaryLine] || '#EE352E';

  const totalMinutes =
    startStationInfo.walkMinutes + totalSubwayTime + endStationInfo.walkMinutes;

  const subwayCoords = pathStations.map((s) => s.coordinates);

  const routeSummary =
    linesUsed.length > 1
      ? `${totalMinutes}-min trip via ${linesUsed.join(' to ')}`
      : primaryLine === 'PATH'
      ? `${totalMinutes}-min ride on the PATH train`
      : `${totalMinutes}-min ride on the ${primaryLine} train`;

  return {
    totalMinutes,
    transitType: 'subway',
    summary: routeSummary,
    lineBullet: primaryLine,
    lineColor,
    walkingStartCoords: [fromPoint, startStationInfo.station.coordinates],
    subwayCoords,
    walkingEndCoords: [endStationInfo.station.coordinates, toPoint],
    boardStationName: startStationInfo.station.name,
    alightStationName: endStationInfo.station.name,
  };
}
