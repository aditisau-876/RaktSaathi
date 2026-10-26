
import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L, {
  type LatLngExpression,
  type LatLngBoundsExpression,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { BloodGroup } from '@/core/types/inventory';

interface RadarNetwork3DProps {
  selectedSerotype: BloodGroup;
  selectedFacilityId: string;
  onSelectFacility: (facilityId: string) => void;
  className?: string;
}

type FacilityStatus = 'critical' | 'warning' | 'nominal';

interface HospitalPlace {
  id: string;
  name: string;
  address: string;
  position: [number, number];
  status: FacilityStatus;
  currentStock: number;
  safetyFloor: number;
  depletionHours?: number;
  demoFacilityId: string;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string | undefined>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

const MAP_CENTER: LatLngExpression = [28.6139, 77.209];

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Avoid repeatedly querying an overloaded public service.
const RETRY_COOLDOWN_MS = 30_000;

const DEMO_FACILITIES = [
  {
    id: 'BB-DEL-A',
    status: 'critical' as const,
    currentStock: 8,
    safetyFloor: 26,
    depletionHours: 18,
  },
  {
    id: 'BB-DEL-B',
    status: 'nominal' as const,
    currentStock: 47,
    safetyFloor: 15,
  },
  {
    id: 'BB-DEL-C',
    status: 'nominal' as const,
    currentStock: 28,
    safetyFloor: 18,
  },
  {
    id: 'BB-DEL-D',
    status: 'warning' as const,
    currentStock: 14,
    safetyFloor: 16,
    depletionHours: 42,
  },
  {
    id: 'BB-DEL-E',
    status: 'nominal' as const,
    currentStock: 32,
    safetyFloor: 18,
  },
  {
    id: 'BB-DEL-F',
    status: 'warning' as const,
    currentStock: 17,
    safetyFloor: 19,
    depletionHours: 36,
  },
];

const STATUS: Record<
  FacilityStatus,
  { label: string; color: string; soft: string }
> = {
  critical: {
    label: 'Critical deficit',
    color: '#c81e36',
    soft: '#fff0f2',
  },
  warning: {
    label: 'Needs attention',
    color: '#b45309',
    soft: '#fff7e8',
  },
  nominal: {
    label: 'Demo stock available',
    color: '#047857',
    soft: '#ecfdf5',
  },
};

const getDemoStock = (index: number, bloodGroup: BloodGroup) => {
  const base = DEMO_FACILITIES[index % DEMO_FACILITIES.length];

  if (bloodGroup === 'O-' && index === 0) {
    return {
      ...base,
      status: 'critical' as const,
      currentStock: 8,
      safetyFloor: 26,
      depletionHours: 18,
    };
  }

  if (bloodGroup === 'AB-' && index === 0) {
    return {
      ...base,
      status: 'critical' as const,
      currentStock: 4,
      safetyFloor: 18,
      depletionHours: 12,
    };
  }

  return base;
};

const applyDemoStock = (
  hospital: HospitalPlace,
  index: number,
  bloodGroup: BloodGroup,
): HospitalPlace => {
  const demo = getDemoStock(index, bloodGroup);

  return {
    ...hospital,
    status: demo.status,
    currentStock: demo.currentStock,
    safetyFloor: demo.safetyFloor,
    depletionHours: demo.depletionHours,
  };
};

const createHospitalIcon = (
  status: FacilityStatus,
  selected: boolean,
) => {
  const color = STATUS[status].color;
  const borderColor = selected ? '#271016' : '#ffffff';

  return L.divIcon({
    className: 'rakt-hospital-marker',
    html: `
      <div style="
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50% 50% 50% 8px;
        transform: rotate(-45deg);
        background: ${color};
        border: ${selected ? 4 : 3}px solid ${borderColor};
        box-shadow: 0 3px 12px rgba(23,32,51,.35);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-family: Arial, sans-serif;
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
        ">+</div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 35],
    popupAnchor: [0, -34],
  });
};

function MapBoundsUpdater({
  hospitals,
}: {
  hospitals: HospitalPlace[];
}) {
  const map = useMap();

  useEffect(() => {
    if (hospitals.length === 0) return;

    if (hospitals.length === 1) {
      map.setView(hospitals[0].position, 13);
      return;
    }

    const bounds: LatLngBoundsExpression = hospitals.map(
      (hospital) => hospital.position,
    );

    map.fitBounds(bounds, {
      padding: [55, 55],
      maxZoom: 13,
    });
  }, [map, hospitals]);

  return null;
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

function getElementPosition(
  element: OverpassElement,
): [number, number] | null {
  if (
    typeof element.lat === 'number' &&
    typeof element.lon === 'number'
  ) {
    return [element.lat, element.lon];
  }

  if (
    element.center &&
    typeof element.center.lat === 'number' &&
    typeof element.center.lon === 'number'
  ) {
    return [element.center.lat, element.center.lon];
  }

  return null;
}

function getHospitalAddress(
  tags: Record<string, string | undefined>,
) {
  const street = tags['addr:street'];
  const houseNumber = tags['addr:housenumber'];
  const area = tags['addr:suburb'] || tags['addr:neighbourhood'];
  const city = tags['addr:city'];

  const streetAddress = [houseNumber, street]
    .filter(Boolean)
    .join(' ');

  const parts = [streetAddress, area, city].filter(Boolean);

  return parts.length
    ? parts.join(', ')
    : 'Address not available in OpenStreetMap data';
}

function parseHospitalResponse(data: OverpassResponse): HospitalPlace[] {
  const elements = data.elements ?? [];

  const mapped = elements
    .filter((element) => {
      const tags = element.tags;

      return Boolean(
        tags &&
          (tags.name || tags['name:en'] || tags['official_name']),
      );
    })
    .map((element) => ({
      element,
      position: getElementPosition(element),
    }))
    .filter(
      (
        item,
      ): item is {
        element: OverpassElement;
        position: [number, number];
      } => item.position !== null,
    );

  const seen = new Set<string>();

  return mapped
    .filter(({ element }) => {
      const tags = element.tags ?? {};
      const name =
        tags['name:en'] ||
        tags.name ||
        tags['official_name'] ||
        'Hospital';

      const uniqueKey = `${element.type}-${element.id}-${name.toLowerCase()}`;

      if (seen.has(uniqueKey)) return false;

      seen.add(uniqueKey);
      return true;
    })
    .slice(0, 30)
    .map(({ element, position }, index) => {
      const tags = element.tags ?? {};
      const demo = getDemoStock(index, 'O-');

      return {
        id: `osm-${element.type}-${element.id}`,
        name:
          tags['name:en'] ||
          tags.name ||
          tags['official_name'] ||
          'Hospital',
        address: getHospitalAddress(tags),
        position,
        status: demo.status,
        currentStock: demo.currentStock,
        safetyFloor: demo.safetyFloor,
        depletionHours: demo.depletionHours,
        demoFacilityId:
          DEMO_FACILITIES[index % DEMO_FACILITIES.length].id,
      };
    });
}

export const RadarNetwork3D: React.FC<RadarNetwork3DProps> = ({
  selectedSerotype,
  selectedFacilityId,
  onSelectFacility,
  className = '',
}) => {
  const [hospitals, setHospitals] = useState<HospitalPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    null,
  );
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryBlockedUntil, setRetryBlockedUntil] = useState(0);
  const [retryWaitSeconds, setRetryWaitSeconds] = useState(0);

  // Load geographic data independently of blood-group and facility changes.
  useEffect(() => {
    const controller = new AbortController();

    async function loadHospitals() {
      setLoadingPlaces(true);
      setPlacesError(null);

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:22000,28.6139,77.2090);
          way["amenity"="hospital"](around:22000,28.6139,77.2090);
          relation["amenity"="hospital"](around:22000,28.6139,77.2090);
        );
        out center tags;
      `;

      try {
        const response = await fetch(OVERPASS_URL, {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: new URLSearchParams({ data: query }).toString(),
          signal: controller.signal,
        });

        if (!response.ok) {
          const statusMessage =
            response.status === 429
              ? 'The hospital data service is rate-limiting requests.'
              : response.status === 502 || response.status === 503
                ? 'The hospital data service is temporarily unavailable.'
                : `Hospital map service returned HTTP ${response.status}.`;

          throw new Error(statusMessage);
        }

        const data = (await response.json()) as OverpassResponse;
        const nextHospitals = parseHospitalResponse(data);

        if (nextHospitals.length === 0) {
          // Preserve any previously loaded data on an empty response.
          setPlacesError(
            'No named hospitals were returned. Previously loaded locations, if any, are being preserved.',
          );
          return;
        }

        setHospitals((previousHospitals) => {
          // Preserve the current marker selection where possible.
          const existingSelection =
            previousHospitals.find(
              (hospital) => hospital.id === selectedPlaceId,
            )?.id ?? null;

          setSelectedPlaceId((previousId) => {
            if (
              previousId &&
              nextHospitals.some(
                (hospital) => hospital.id === previousId,
              )
            ) {
              return previousId;
            }

            const parentSelected = nextHospitals.find(
              (hospital) =>
                hospital.demoFacilityId === selectedFacilityId,
            );

            return (
              parentSelected?.id ??
              existingSelection ??
              nextHospitals[0].id
            );
          });

          return nextHospitals.map((hospital, index) =>
            applyDemoStock(hospital, index, selectedSerotype),
          );
        });

        setRetryBlockedUntil(0);
      } catch (error) {
        if (controller.signal.aborted) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Could not load hospital locations.';

        // Avoid automatic retry loops when the public service is busy.
        setRetryBlockedUntil(Date.now() + RETRY_COOLDOWN_MS);

        setPlacesError(
          `${message} ${
            hospitals.length > 0
              ? 'Previously loaded hospital locations are still displayed.'
              : 'The map itself can remain available while hospital locations are retried.'
          }`,
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingPlaces(false);
        }
      }
    }

    void loadHospitals();

    return () => controller.abort();
    // Intentionally only re-run for an explicit retry.
    // Selection changes do not require another geographic lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Update illustrative stock without calling the external hospital API.
  useEffect(() => {
    setHospitals((current) =>
      current.map((hospital, index) =>
        applyDemoStock(hospital, index, selectedSerotype),
      ),
    );
  }, [selectedSerotype]);

  // Count down the retry cooldown only while a failure is present.
  useEffect(() => {
    if (!placesError || retryBlockedUntil <= Date.now()) {
      setRetryWaitSeconds(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.ceil((retryBlockedUntil - Date.now()) / 1000),
      );

      setRetryWaitSeconds(remaining);
    };

    updateRemaining();

    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [placesError, retryBlockedUntil]);

  const selectedHospital = useMemo(
    () =>
      hospitals.find(
        (hospital) => hospital.id === selectedPlaceId,
      ) ?? null,
    [hospitals, selectedPlaceId],
  );

  const selectedHospitalFromParent = useMemo(
    () =>
      hospitals.find(
        (hospital) =>
          hospital.demoFacilityId === selectedFacilityId,
      ) ?? null,
    [hospitals, selectedFacilityId],
  );

  useEffect(() => {
    if (selectedHospitalFromParent) {
      setSelectedPlaceId(selectedHospitalFromParent.id);
    }
  }, [selectedHospitalFromParent]);

  const handleRetry = () => {
    if (Date.now() < retryBlockedUntil) return;

    setRetryCount((count) => count + 1);
  };

  return (
    <div
      className={`relative isolate h-[460px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_18px_50px_rgba(20,30,45,.14)] sm:h-[500px] lg:h-[560px] ${className}`}
    >
      <MapContainer
        center={MAP_CENTER}
        zoom={11}
        minZoom={3}
        maxZoom={18}
        scrollWheelZoom
        className="h-full w-full"
        style={{
          height: '100%',
          width: '100%',
          background: '#eaf0e8',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater hospitals={hospitals} />
        <MapResizeHandler />

        {hospitals.map((hospital) => {
          const selected =
            hospital.id === selectedPlaceId ||
            hospital.demoFacilityId === selectedFacilityId;

          return (
            <Marker
              key={hospital.id}
              position={hospital.position}
              icon={createHospitalIcon(hospital.status, selected)}
              eventHandlers={{
                click: () => {
                  setSelectedPlaceId(hospital.id);
                  onSelectFacility(hospital.demoFacilityId);
                },
              }}
              zIndexOffset={
                selected
                  ? 1000
                  : hospital.status === 'critical'
                    ? 500
                    : 0
              }
            >
              <Popup maxWidth={300} minWidth={245}>
                <div className="w-[245px] overflow-hidden font-sans text-slate-900">
                  <div className="border-b border-slate-200 pb-3">
                    <div className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">
                      OpenStreetMap · Hospital listing
                    </div>

                    <h3 className="mt-1 text-sm font-bold leading-5 text-slate-950">
                      {hospital.name}
                    </h3>

                    <p className="mt-1 text-xs leading-4 text-slate-600">
                      {hospital.address}
                    </p>
                  </div>

                  <div
                    className="mt-3 rounded-lg border p-3"
                    style={{
                      borderColor: `${STATUS[hospital.status].color}45`,
                      background: STATUS[hospital.status].soft,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: STATUS[hospital.status].color,
                        }}
                      >
                        {STATUS[hospital.status].label}
                      </span>

                      <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-slate-600">
                        DEMO
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] text-slate-500">
                          Example stock
                        </div>
                        <div className="text-lg font-extrabold text-slate-950">
                          {hospital.currentStock} units
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500">
                          Safety floor
                        </div>
                        <div className="text-lg font-extrabold text-slate-950">
                          {hospital.safetyFloor} units
                        </div>
                      </div>
                    </div>

                    {hospital.depletionHours !== undefined && (
                      <p className="mt-1 text-[10px] text-slate-600">
                        Illustrative runout estimate:{' '}
                        {hospital.depletionHours}h
                      </p>
                    )}
                  </div>

                  <p className="mt-2 text-[10px] leading-4 text-slate-500">
                    The map location comes from OpenStreetMap. Stock,
                    shortage status and risk values are simulated demo
                    data, not this hospital&apos;s reported inventory.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectFacility(hospital.demoFacilityId)
                    }
                    className="mt-3 w-full rounded-lg bg-[#8f1028] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#6f0c1f] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                  >
                    Open demo facility details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map label */}
      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex max-w-[calc(100%-24px)] flex-wrap items-center gap-2 sm:left-4 sm:top-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_4px_18px_rgba(15,23,42,.16)]">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-600 ring-4 ring-rose-100" />

          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[.08em] text-slate-900 sm:text-xs">
              Delhi NCR hospital map
            </div>
            <div className="mt-0.5 text-[10px] font-medium text-slate-600">
              OpenStreetMap · Real mapped roads
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-300 bg-[#fff8e8] px-3 py-2.5 text-[10px] font-bold text-amber-900 shadow-[0_4px_18px_rgba(15,23,42,.12)]">
          Demo risk data
        </div>
      </div>

      {/* Map legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex max-w-[calc(100%-24px)] flex-wrap gap-2 sm:bottom-4 sm:left-4">
        {(Object.keys(STATUS) as FacilityStatus[]).map((status) => (
          <div
            key={status}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-[0_3px_12px_rgba(15,23,42,.15)]"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: STATUS[status].color }}
            />

            <span className="text-[10px] font-bold text-slate-800">
              {STATUS[status].label}
            </span>
          </div>
        ))}
      </div>

      {loadingPlaces && (
        <div className="absolute right-3 top-[76px] z-[500] flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg sm:right-4">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-rose-700" />
          Finding mapped hospitals…
        </div>
      )}

      {placesError && !loadingPlaces && (
        <div className="absolute bottom-[68px] right-3 z-[500] max-w-[min(360px,calc(100%-24px))] rounded-xl border border-rose-200 bg-white p-3 text-xs leading-5 text-rose-900 shadow-lg sm:bottom-4 sm:right-4">
          <p>{placesError}</p>

          {retryWaitSeconds > 0 ? (
            <p className="mt-2 text-[11px] font-semibold text-slate-600">
              You can retry in {retryWaitSeconds} seconds.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 rounded-lg bg-[#8f1028] px-3 py-1.5 font-bold text-white hover:bg-[#6f0c1f]"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!loadingPlaces && !placesError && hospitals.length > 0 && (
        <div className="absolute right-3 top-[76px] z-[500] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-lg sm:right-4">
          {hospitals.length} mapped hospital listings
        </div>
      )}

      {selectedHospital && (
        <div className="sr-only" aria-live="polite">
          Selected hospital: {selectedHospital.name}
        </div>
      )}
    </div>
  );
};

export default RadarNetwork3D;
