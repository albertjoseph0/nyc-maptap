import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon as turfPolygon } from '@turf/helpers';
import { Neighborhood } from '../types/game';

/**
 * Tests if a [lng, lat] point is inside a neighborhood boundary
 */
export function isPointInNeighborhood(
  pt: [number, number],
  neighborhood: Neighborhood
): boolean {
  try {
    const ptFeature = point(pt);
    const polyFeature = turfPolygon(neighborhood.coordinates);
    return booleanPointInPolygon(ptFeature, polyFeature);
  } catch {
    // Fallback ray-casting
    const [x, y] = pt;
    const ring = neighborhood.coordinates[0];
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
}

/**
 * Identifies which neighborhood contains the given [lng, lat]
 */
export function findNeighborhoodAtPoint(
  pt: [number, number],
  neighborhoods: Neighborhood[]
): Neighborhood | null {
  for (const n of neighborhoods) {
    if (isPointInNeighborhood(pt, n)) {
      return n;
    }
  }
  return null;
}
