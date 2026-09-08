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

export function findCandidateStations(
  point: [number, number],
  preferredRegion?: 'manhattan' | 'brooklyn' | 'queens' | 'nj',
  allowNjTransfers: boolean = false,
  limit: number = 4
): {
  station: SubwayStation;
  distMiles: number;
  walkMinutes: number;
}[] {
  const region = preferredRegion || detectRegionForPoint(point);
  const candidateStations = SUBWAY_STATIONS.filter((s) => {
    // If NJ transfers are not allowed, never pick a station with region === 'nj_transfer' or pure PATH stations
    if (!allowNjTransfers && (s.region === 'nj_transfer' || (s.lines.length === 1 && s.lines[0] === 'PATH'))) {
      return false;
    }
    if ((s.region || 'manhattan') === region) return true;
    if (allowNjTransfers && s.region === 'nj_transfer') return true;
    return false;
  });
  const stationsToSearch =
    candidateStations.length > 0
      ? candidateStations
      : SUBWAY_STATIONS.filter((s) => allowNjTransfers || (s.region !== 'nj_transfer' && s.lines[0] !== 'PATH'));

  return stationsToSearch
    .map((station) => {
      const distMiles = getDistanceMiles(point, station.coordinates);
      const walkMinutes = Math.max(1, Math.round(distMiles * 20)); // ~20 min per mile (3 mph)
      return { station, distMiles, walkMinutes };
    })
    .sort((a, b) => a.distMiles - b.distMiles)
    .slice(0, limit);
}

export function findNearestStation(
  point: [number, number],
  preferredRegion?: 'manhattan' | 'brooklyn' | 'queens' | 'nj',
  allowNjTransfers: boolean = false
): {
  station: SubwayStation;
  distMiles: number;
  walkMinutes: number;
} {
  const candidates = findCandidateStations(point, preferredRegion, allowNjTransfers, 1);
  return (
    candidates[0] || {
      station: SUBWAY_STATIONS[0],
      distMiles: 1,
      walkMinutes: 5,
    }
  );
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
  endId: string,
  allowPath: boolean = true
): { pathStations: SubwayStation[]; linesUsed: string[]; totalSubwayTime: number } | null {
  if (startId === endId) {
    const st = SUBWAY_STATIONS_MAP.get(startId);
    return st ? { pathStations: [st], linesUsed: [], totalSubwayTime: 0 } : null;
  }

  // Build adjacency list
  const adj = new Map<string, SubwayEdge[]>();
  for (const edge of SUBWAY_EDGES) {
    if (!allowPath) {
      if (edge.line === 'PATH') continue;
      const fromSt = SUBWAY_STATIONS_MAP.get(edge.from);
      const toSt = SUBWAY_STATIONS_MAP.get(edge.to);
      if (fromSt?.region === 'nj_transfer' || toSt?.region === 'nj_transfer') continue;
      if (fromSt?.lines.length === 1 && fromSt.lines[0] === 'PATH') continue;
      if (toSt?.lines.length === 1 && toSt.lines[0] === 'PATH') continue;
    }
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

  // PATH is strictly reserved for trips between New Jersey and New York, or within New Jersey
  const allowPath = fromRegion === 'nj' || toRegion === 'nj';

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

  const startCandidates = findCandidateStations(fromPoint, fromRegion, allowPath, 3);
  const endCandidates = findCandidateStations(toPoint, toRegion, allowPath, 4);

  // If both map to the same station, direct walking is always appropriate
  if (startCandidates[0]?.station.id === endCandidates[0]?.station.id) {
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

  let bestRoute: {
    start: { station: SubwayStation; distMiles: number; walkMinutes: number };
    end: { station: SubwayStation; distMiles: number; walkMinutes: number };
    dijkstra: { pathStations: SubwayStation[]; linesUsed: string[]; totalSubwayTime: number };
    perceivedCost: number;
  } | null = null;

  for (const start of startCandidates) {
    for (const end of endCandidates) {
      if (start.station.id === end.station.id) continue;
      const dijkstraResult = solveSubwayDijkstra(
        start.station.id,
        end.station.id,
        allowPath
      );
      if (!dijkstraResult || dijkstraResult.pathStations.length === 0 || dijkstraResult.linesUsed.length === 0) continue;

      // Realistic human transit preference: walking + train ride + 4-minute penalty per transfer
      const transferCount = Math.max(0, dijkstraResult.linesUsed.length - 1);
      const perceivedCost =
        start.walkMinutes + dijkstraResult.totalSubwayTime + end.walkMinutes + transferCount * 4;

      if (!bestRoute || perceivedCost < bestRoute.perceivedCost) {
        bestRoute = {
          start,
          end,
          dijkstra: dijkstraResult,
          perceivedCost,
        };
      }
    }
  }

  if (!bestRoute || bestRoute.dijkstra.linesUsed.length === 0) {
    // Fallback: direct walking
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

  const { start, end, dijkstra } = bestRoute;
  const { pathStations, linesUsed, totalSubwayTime } = dijkstra;
  const primaryLine = linesUsed[0] || '1';
  const lineColor = MTA_LINE_COLORS[primaryLine] || '#EE352E';

  const totalMinutes = start.walkMinutes + totalSubwayTime + end.walkMinutes;
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
    walkingStartCoords: [fromPoint, start.station.coordinates],
    subwayCoords,
    walkingEndCoords: [end.station.coordinates, toPoint],
    boardStationName: start.station.name,
    alightStationName: end.station.name,
  };
}
