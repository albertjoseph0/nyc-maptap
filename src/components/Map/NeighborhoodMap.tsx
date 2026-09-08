import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Neighborhood, RoundResult } from '../../types/game';
import { MANHATTAN_NEIGHBORHOODS } from '../../data/neighborhoods';

interface NeighborhoodMapProps {
  target: Neighborhood | null;
  lastResult: RoundResult | null;
  onMapTap: (point: [number, number]) => void;
}

export const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({
  target,
  lastResult,
  onMapTap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const isMapLoadedRef = useRef(false);

  const onMapTapRef = useRef(onMapTap);
  onMapTapRef.current = onMapTap;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-73.985, 40.728],
      zoom: isMobile ? 10.45 : 11.1,
      minZoom: 10.0, // Allow zooming out enough to see the full regional transit route
      maxZoom: 16.5,
      maxBounds: [
        [-74.30, 40.25],
        [-73.70, 41.20],
      ],
      attributionControl: false,
      dragRotate: false,
      touchPitch: false,
    });

    mapRef.current = map;
    (window as any).__nycMap = map;

    map.on('load', () => {
      isMapLoadedRef.current = true;

      // Hide all labels for pure spatial test
      const style = map.getStyle();
      if (style && style.layers) {
        for (const layer of style.layers) {
          if (
            layer.type === 'symbol' &&
            (layer.id.includes('label') ||
              layer.id.includes('place') ||
              layer.id.includes('poi'))
          ) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        }
      }

      // GeoJSON source for neighborhoods
      map.addSource('neighborhoods', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: MANHATTAN_NEIGHBORHOODS.map((n) => ({
            type: 'Feature',
            id: n.id,
            properties: { id: n.id, name: n.name },
            geometry: {
              type: 'Polygon',
              coordinates: n.coordinates,
            },
          })),
        },
      });

      // Fill Layer
      map.addLayer({
        id: 'neighborhood-fills',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': '#334155',
          'fill-opacity': 0.14,
        },
      });

      // Crisp Borders Layer (makes parcels across Hudson & East Rivers clearly defined)
      map.addLayer({
        id: 'neighborhood-borders',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#475569',
          'line-width': 1.2,
          'line-opacity': 0.85,
        },
      });

      // Subway Routing Sources & Layers
      map.addSource('subway-walking', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addSource('subway-track', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addSource('subway-stations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Walking Dashed Line Layer
      map.addLayer({
        id: 'subway-walking-layer',
        type: 'line',
        source: 'subway-walking',
        paint: {
          'line-color': '#E2E8F0',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.85,
        },
      });

      // Subway Track Glow (Neon Ambient Underlay)
      map.addLayer({
        id: 'subway-track-glow',
        type: 'line',
        source: 'subway-track',
        paint: {
          'line-color': '#EE352E',
          'line-width': 9,
          'line-opacity': 0.45,
          'line-blur': 3,
        },
      });

      // Subway Track Line (Crisp Vibrant MTA Line)
      map.addLayer({
        id: 'subway-track-layer',
        type: 'line',
        source: 'subway-track',
        paint: {
          'line-color': '#EE352E',
          'line-width': 4.5,
          'line-opacity': 1.0,
        },
      });

      // Station Dots
      map.addLayer({
        id: 'subway-stations-layer',
        type: 'circle',
        source: 'subway-stations',
        paint: {
          'circle-radius': 5.5,
          'circle-color': '#FFFFFF',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#EE352E',
        },
      });

      updateMapHighlights();
    });

    map.on('click', (e) => {
      onMapTapRef.current([e.lngLat.lng, e.lngLat.lat]);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      isMapLoadedRef.current = false;
    };
  }, []);

  useEffect(() => {
    updateMapHighlights();
  }, [target, lastResult]);

  const updateMapHighlights = () => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;

    const walkingSource = map.getSource('subway-walking') as maplibregl.GeoJSONSource;
    const trackSource = map.getSource('subway-track') as maplibregl.GeoJSONSource;
    const stationsSource = map.getSource('subway-stations') as maplibregl.GeoJSONSource;

    // Reset pin and route if new round without result
    if (!lastResult) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      map.setPaintProperty('neighborhood-fills', 'fill-color', '#334155');
      map.setPaintProperty('neighborhood-fills', 'fill-opacity', 0.14);
      map.setPaintProperty('neighborhood-borders', 'line-color', '#475569');
      map.setPaintProperty('neighborhood-borders', 'line-width', 1.2);
      map.setPaintProperty('neighborhood-borders', 'line-opacity', 0.85);

      walkingSource?.setData({ type: 'FeatureCollection', features: [] });
      trackSource?.setData({ type: 'FeatureCollection', features: [] });
      stationsSource?.setData({ type: 'FeatureCollection', features: [] });

      // Smoothly return to full metropolitan overview with zeroed padding
      const isMobile = window.innerWidth < 640;
      map.flyTo({
        center: [-73.985, 40.728],
        zoom: isMobile ? 10.45 : 11.1,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: 700,
        essential: true,
      });
      return;
    }

    // Active Result Styling
    const targetId = lastResult.target.id;
    const tappedId = lastResult.tapped?.id || '';
    const isCorrect = lastResult.isCorrect;

    // Fill colors
    map.setPaintProperty('neighborhood-fills', 'fill-color', [
      'case',
      ['==', ['get', 'id'], targetId],
      '#10B981', // Emerald green for target
      ['==', ['get', 'id'], tappedId],
      '#EF4444', // Red for tapped miss
      '#0F172A',
    ]);

    map.setPaintProperty('neighborhood-fills', 'fill-opacity', [
      'case',
      ['==', ['get', 'id'], targetId],
      isCorrect ? 0.7 : 0.45,
      ['==', ['get', 'id'], tappedId],
      0.55,
      0.08,
    ]);

    // Border highlights
    map.setPaintProperty('neighborhood-borders', 'line-color', [
      'case',
      ['==', ['get', 'id'], targetId],
      '#34D399',
      ['==', ['get', 'id'], tappedId],
      '#F87171',
      '#1E293B',
    ]);

    map.setPaintProperty('neighborhood-borders', 'line-width', [
      'case',
      ['==', ['get', 'id'], targetId],
      3.5,
      ['==', ['get', 'id'], tappedId],
      2,
      0.8,
    ]);

    // Pin marker at tap location
    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = `w-4 h-4 rounded-full border-2 border-white shadow-xl ${
        isCorrect ? 'bg-emerald-400' : 'bg-rose-500'
      }`;
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(lastResult.clickedPoint)
        .addTo(map);
    }

    // If missed and we have a subway route, draw the route!
    if (!isCorrect && lastResult.subwayRoute) {
      const route = lastResult.subwayRoute;
      const lineColor = route.lineColor || '#EE352E';

      // Update line colors
      map.setPaintProperty('subway-track-glow', 'line-color', lineColor);
      map.setPaintProperty('subway-track-layer', 'line-color', lineColor);
      map.setPaintProperty('subway-stations-layer', 'circle-stroke-color', lineColor);

      // Walking segments GeoJSON
      const walkingFeatures: GeoJSON.Feature[] = [];
      if (route.walkingStartCoords && route.walkingStartCoords.length >= 2) {
        walkingFeatures.push({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: route.walkingStartCoords },
        });
      }
      if (route.walkingEndCoords && route.walkingEndCoords.length >= 2) {
        walkingFeatures.push({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: route.walkingEndCoords },
        });
      }
      walkingSource?.setData({
        type: 'FeatureCollection',
        features: walkingFeatures,
      });

      // Subway Track GeoJSON
      if (route.subwayCoords && route.subwayCoords.length >= 2) {
        trackSource?.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: route.subwayCoords },
            },
          ],
        });
      } else {
        trackSource?.setData({ type: 'FeatureCollection', features: [] });
      }

      // Station Dots GeoJSON (First & Last station of subway segment)
      const stationFeatures: GeoJSON.Feature[] = [];
      if (route.transitType === 'subway' && route.subwayCoords.length > 0) {
        // Boarding station
        stationFeatures.push({
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: route.subwayCoords[0] },
        });
        // Alighting station
        if (route.subwayCoords.length > 1) {
          stationFeatures.push({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: route.subwayCoords[route.subwayCoords.length - 1],
            },
          });
        }
      }
      stationsSource?.setData({
        type: 'FeatureCollection',
        features: stationFeatures,
      });

      // Auto-fit camera to frame tap point, complete target polygon, and subway route
      const allPoints: [number, number][] = [
        lastResult.clickedPoint,
        lastResult.target.center,
        ...(lastResult.target.coordinates[0] || []),
        ...(route.subwayCoords || []),
        ...(route.walkingStartCoords || []),
        ...(route.walkingEndCoords || []),
      ];
      const lngs = allPoints.map((p) => p[0]);
      const lats = allPoints.map((p) => p[1]);

      const isMobile = window.innerWidth < 640;
      const padding = isMobile
        ? { top: 230, bottom: 110, left: 24, right: 24 }
        : { top: 190, bottom: 100, left: 50, right: 50 };

      map.fitBounds(
        [
          [Math.min(...lngs) - 0.008, Math.min(...lats) - 0.006],
          [Math.max(...lngs) + 0.008, Math.max(...lats) + 0.006],
        ],
        {
          padding,
          duration: 1000,
        }
      );
    } else if (isCorrect) {
      // Direct hit: center on target neighborhood
      const isMobile = window.innerWidth < 640;
      map.flyTo({
        center: lastResult.target.center,
        zoom: isMobile ? 12.8 : 13.2,
        duration: 800,
      });
      walkingSource?.setData({ type: 'FeatureCollection', features: [] });
      trackSource?.setData({ type: 'FeatureCollection', features: [] });
      stationsSource?.setData({ type: 'FeatureCollection', features: [] });
    } else {
      walkingSource?.setData({ type: 'FeatureCollection', features: [] });
      trackSource?.setData({ type: 'FeatureCollection', features: [] });
      stationsSource?.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
