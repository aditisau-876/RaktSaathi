
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { MetricTile } from '@/components/common/MetricTile';
import { SegmentedControl } from '@/components/common/SegmentedControl';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
).replace(/\/$/, '');

type WaveFilter = 'ALL' | 1 | 2 | 3;

interface ApiDonor {
  id: string;
  pseudonym?: string | null;
  blood_group: string;
  location_zone?: string | null;
  distance_km?: number | null;
  last_donation?: string | null;
  available: boolean;
  consented: boolean;
  contact_masked?: string | null;
}

interface Donor {
  id: string;
  pseudonym: string;
  bloodGroup: string;
  locationZone: string;
  distanceKm: number | null;
  lastDonation: string | null;
  available: boolean;
  consented: boolean;
  contactMasked: string;
  wave: 1 | 2 | 3 | null;
}

function getWave(distance: number | null): 1 | 2 | 3 | null {
  if (distance === null || distance < 0 || distance > 8) return null;
  if (distance <= 3) return 1;
  if (distance <= 5) return 2;
  return 3;
}

function mapDonor(item: ApiDonor): Donor {
  const distance =
    typeof item.distance_km === 'number' &&
    Number.isFinite(item.distance_km)
      ? item.distance_km
      : null;

  return {
    id: item.id,
    pseudonym: item.pseudonym || 'Anonymous donor',
    bloodGroup: item.blood_group,
    locationZone: item.location_zone || 'Zone not specified',
    distanceKm: distance,
    lastDonation: item.last_donation || null,
    available: item.available,
    consented: item.consented,
    contactMasked: item.contact_masked || 'Not provided',
    wave: getWave(distance),
  };
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') return body.detail;
    if (body.detail) return JSON.stringify(body.detail);
  } catch {
    // Fall back to the HTTP status message.
  }

  return `Request failed (${response.status} ${response.statusText})`;
}

function formatLastDonation(value: string | null): string {
  if (!value) return 'Not recorded';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const DonorNetworkPage: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedWave, setSelectedWave] = useState<WaveFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`${API_BASE_URL}/donors`);

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data: ApiDonor[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('The donor API did not return a list.');
      }

      setDonors(data.map(mapDonor));
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Check that FastAPI is running and the API URL is correct.`
          : 'Unable to load donors from the backend.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDonors();
  }, [fetchDonors]);

  const eligibleDonors = useMemo(
    () => donors.filter((donor) => donor.available && donor.consented),
    [donors]
  );

  const withinEightKm = useMemo(
    () =>
      eligibleDonors.filter(
        (donor) => donor.distanceKm !== null && donor.distanceKm <= 8
      ),
    [eligibleDonors]
  );

  const waveCounts = useMemo(
    () => ({
      1: withinEightKm.filter((donor) => donor.wave === 1).length,
      2: withinEightKm.filter((donor) => donor.wave === 2).length,
      3: withinEightKm.filter((donor) => donor.wave === 3).length,
    }),
    [withinEightKm]
  );

  const filteredDonors = useMemo(() => {
    const source =
      selectedWave === 'ALL' ? donors : donors.filter(
        (donor) => donor.wave === selectedWave
      );

    return source;
  }, [donors, selectedWave]);

  const waveFilterOptions = [
    { value: 'ALL' as const, label: 'All Donors', badge: donors.length },
    {
      value: 1 as const,
      label: 'Wave 1 (≤3 km)',
      badge: waveCounts[1],
      alertDot: true,
    },
    {
      value: 2 as const,
      label: 'Wave 2 (≤5 km)',
      badge: waveCounts[2],
    },
    {
      value: 3 as const,
      label: 'Wave 3 (≤8 km)',
      badge: waveCounts[3],
    },
  ];

  const handleReviewWave = (wave: 1 | 2 | 3) => {
    setSelectedWave(wave);
    setNotice(
      `Wave ${wave} selected. Review consent and availability before any outreach. No messages have been sent.`
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">
              group
            </span>
            <span>DONOR NETWORK • CONSENT-AWARE OUTREACH PLANNING</span>
          </div>

          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Donor Network Outreach Intelligence
          </h1>

          <p className="text-sm text-ink-muted leading-relaxed">
            Review available, consented donors and organize a proximity-based
            outreach shortlist. Distance bands are derived from stored donor
            records; they are not live GPS tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/campaign-studio">
            <Button variant="primary" icon="campaign" iconPosition="right">
              Open Campaign Studio
            </Button>
          </Link>

          <Button
            variant="secondary"
            icon="refresh"
            onClick={() => void fetchDonors()}
            disabled={loading}
          >
            Refresh Donors
          </Button>
        </div>
      </section>

      {/* API feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <div className="font-bold">Unable to load donor records</div>
          <p className="mt-1 break-words">{error}</p>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
        >
          {notice}
        </div>
      )}

      {/* Metrics from backend data */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Donor network summary"
      >
        <MetricTile
          label="Available & Consented"
          value={loading ? '—' : String(eligibleDonors.length)}
          unit="Donors"
          subtext="Both availability and consent are required"
          icon="verified_user"
          trend={{
            value: 'Based on backend records',
            isPositive: !loading && !error,
            isWarning: Boolean(error),
          }}
          progressPercent={0}
        />

        <MetricTile
          label="Wave 1 Proximity"
          value={loading ? '—' : String(waveCounts[1])}
          unit="Donors"
          subtext="Within 3 km and eligible"
          icon="near_me"
          isCritical={waveCounts[1] > 0}
          trend={{
            value: 'Distance-band shortlist',
            isWarning: waveCounts[1] > 0,
          }}
          progressPercent={0}
        />

        <MetricTile
          label="Eligible Within 8 km"
          value={loading ? '—' : String(withinEightKm.length)}
          unit="Donors"
          subtext="Stored distance ≤8 km"
          icon="groups"
          trend={{
            value: 'Not a live location count',
            isPositive: !loading && !error,
          }}
          progressPercent={0}
        />

        <MetricTile
          label="Consent Governance"
          value={loading ? '—' : String(eligibleDonors.length)}
          unit="Eligible Records"
          subtext="Available and consented donors only"
          icon="shield"
          trend={{
            value: 'Consent flag checked',
            isPositive: !loading && !error,
          }}
          progressPercent={0}
        />
      </section>

      {/* Proximity bands and review queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7">
          <GlassPanel className="p-6 h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  hub
                </span>
                <h2 className="font-display font-bold text-base text-ink-main">
                  Proximity Corridor Overview
                </h2>
              </div>

              <span className="text-xs font-mono text-ink-secondary">
                Schematic
              </span>
            </div>

            {/* Illustrative map: not live geographic coordinates */}
            <div className="w-full min-h-72 relative bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-center overflow-hidden">
              <svg
                className="w-full h-full min-h-64"
                viewBox="0 0 500 320"
                role="img"
                aria-label="Illustration of three proximity bands around a hub. This is not a live map."
              >
                <circle
                  cx="250"
                  cy="155"
                  r="135"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="250"
                  cy="155"
                  r="90"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="250"
                  cy="155"
                  r="45"
                  fill="none"
                  stroke="#FDA4AF"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />

                <circle
                  cx="250"
                  cy="155"
                  r="23"
                  fill="#DC2626"
                  fillOpacity="0.12"
                />
                <circle
                  cx="250"
                  cy="155"
                  r="10"
                  fill="#93000B"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />

                <text
                  x="250"
                  y="193"
                  textAnchor="middle"
                  fill="#0F172A"
                  fontSize="11"
                  fontWeight="800"
                >
                  REFERENCE HUB
                </text>
                <text
                  x="250"
                  y="208"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="9"
                >
                  Schematic only
                </text>

                <text x="292" y="145" fill="#DC2626" fontSize="10" fontWeight="700">
                  ≤3 km
                </text>
                <text x="334" y="145" fill="#475569" fontSize="10" fontWeight="700">
                  ≤5 km
                </text>
                <text x="376" y="145" fill="#64748B" fontSize="10" fontWeight="700">
                  ≤8 km
                </text>

                <circle cx="230" cy="140" r="5" fill="#93000B" />
                <circle cx="265" cy="130" r="5" fill="#93000B" />
                <circle cx="270" cy="175" r="5" fill="#93000B" />
                <circle cx="180" cy="130" r="4.5" fill="#EA580C" />
                <circle cx="320" cy="135" r="4.5" fill="#EA580C" />
                <circle cx="300" cy="215" r="4.5" fill="#EA580C" />
                <circle cx="140" cy="105" r="4" fill="#64748B" />
                <circle cx="360" cy="110" r="4" fill="#64748B" />
                <circle cx="350" cy="235" r="4" fill="#64748B" />
              </svg>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              The circles illustrate distance bands only. The backend supplies
              distances, not donor coordinates or live route ETAs.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <div className="text-[10px] font-mono text-red-800 font-bold">
                  WAVE 1
                </div>
                <div className="text-xl font-display font-bold text-ink-main">
                  {loading ? '—' : waveCounts[1]}
                </div>
                <div className="text-[10px] text-ink-secondary">≤3 km</div>
              </div>

              <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                <div className="text-[10px] font-mono text-orange-800 font-bold">
                  WAVE 2
                </div>
                <div className="text-xl font-display font-bold text-ink-main">
                  {loading ? '—' : waveCounts[2]}
                </div>
                <div className="text-[10px] text-ink-secondary">≤5 km</div>
              </div>

              <div className="rounded-lg bg-slate-100 border border-slate-200 p-3">
                <div className="text-[10px] font-mono text-slate-700 font-bold">
                  WAVE 3
                </div>
                <div className="text-xl font-display font-bold text-ink-main">
                  {loading ? '—' : waveCounts[3]}
                </div>
                <div className="text-[10px] text-ink-secondary">≤8 km</div>
              </div>
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-5">
          <GlassPanel className="p-6 space-y-4 h-full">
            <h3 className="font-display font-bold text-base text-ink-main">
              Review Donors by Proximity
            </h3>

            {(
              [
                {
                  wave: 1 as const,
                  title: 'Wave 01 · Nearby',
                  radius: '≤3 km',
                  count: waveCounts[1],
                  style: 'bg-red-50/50 border-red-200',
                },
                {
                  wave: 2 as const,
                  title: 'Wave 02 · Regional',
                  radius: '≤5 km',
                  count: waveCounts[2],
                  style: 'bg-orange-50/50 border-orange-200',
                },
                {
                  wave: 3 as const,
                  title: 'Wave 03 · Extended',
                  radius: '≤8 km',
                  count: waveCounts[3],
                  style: 'bg-slate-50 border-slate-200',
                },
              ]
            ).map((item) => (
              <div
                key={item.wave}
                className={`p-4 rounded-xl border ${item.style}`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase">
                    {item.title}
                  </span>
                  <span className="text-xs font-mono text-ink-secondary">
                    {item.radius}
                  </span>
                </div>

                <div className="flex justify-between items-baseline gap-2 mt-1">
                  <span className="text-xl font-display font-bold text-ink-main">
                    {loading ? '—' : item.count} eligible
                  </span>
                  <span className="text-xs font-mono text-ink-secondary">
                    No yield estimate
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-ink-secondary">
                    Filter the donor list
                  </p>
                  <Button
                    variant={item.wave === 1 ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleReviewWave(item.wave)}
                  >
                    Review Wave
                  </Button>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">
                  info
                </span>
                Outreach not dispatched
              </div>
              <p className="text-xs text-amber-900/90 mt-2 leading-relaxed">
                This backend connection supports donor listing. A real
                outreach action needs a dedicated backend endpoint and an
                authorized messaging workflow.
              </p>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Backend donor list */}
      <GlassPanel className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="font-display font-bold text-base text-ink-main">
              Donor Network ({filteredDonors.length})
            </h2>
            <p className="text-xs text-ink-secondary mt-1">
              Donor details returned by the API. Contact information remains
              masked where provided.
            </p>
          </div>

          <SegmentedControl
            options={waveFilterOptions}
            value={selectedWave}
            onChange={(value) => setSelectedWave(value as WaveFilter)}
            size="sm"
            label="Donor proximity filter"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-ink-secondary border-b border-slate-200/80">
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">
                  Donor ID
                </th>
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">
                  Location Zone
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">
                  Blood Group
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">
                  Distance
                </th>
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">
                  Last Donation
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">
                  Availability
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">
                  Consent
                </th>
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">
                  Masked Contact
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans">
              {!loading && filteredDonors.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-ink-secondary"
                  >
                    {error
                      ? 'Donors could not be loaded. Resolve the connection error and refresh.'
                      : 'No donors match this filter.'}
                  </td>
                </tr>
              )}

              {filteredDonors.map((donor) => (
                <tr
                  key={donor.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <span className="font-mono font-bold text-ink-main block">
                      {donor.id}
                    </span>
                    <span className="text-[11px] text-ink-secondary">
                      {donor.pseudonym}
                    </span>
                  </td>

                  <td className="py-3.5 px-6 text-ink-main">
                    {donor.locationZone}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-primary">
                    {donor.bloodGroup}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                    {donor.distanceKm === null
                      ? 'Not recorded'
                      : `${donor.distanceKm.toFixed(1)} km`}
                  </td>

                  <td className="py-3.5 px-6 text-ink-secondary">
                    {formatLastDonation(donor.lastDonation)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold border ${
                        donor.available
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {donor.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold border ${
                        donor.consented
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {donor.consented ? 'Consented' : 'Not consented'}
                    </span>
                  </td>

                  <td className="py-3.5 px-6 text-ink-secondary">
                    {donor.contactMasked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
};
