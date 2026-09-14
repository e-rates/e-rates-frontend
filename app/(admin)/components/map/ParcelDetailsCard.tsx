'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Crosshair, X } from 'lucide-react';
import { backendJson } from '@/lib/backend';
import { formatMoney } from '@/lib/format';
import { usePaymentStatus } from '@/lib/paymentStatuses';
import { PAYMENT_COLORS } from './ParcelGeoJSONLayer';
import { DeleteParcelAction } from './DeleteParcelAction';

interface ParcelDetailsCardProps {
  parcel: any | null;
  onClose: () => void;
  onZoom?: (parcelRef: string) => void;
}

interface OwnerDetails {
  username: string;
  email: string;
  phone: string | null;
  national_id: string | null;
  county: string;
  is_active: boolean;
  last_login: string | null;
}

interface Bill {
  payment_id: string;
  payment_year: number | null;
  amount: string;
  status: string;
  processor_ref: string | null;
  days_overdue: number | null;
}

const titleCase = (value: string) => value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const BILL_LABELS: Record<string, string> = {
  completed: 'Paid',
  processing: 'Confirming',
  pending: 'Unpaid',
  failed: 'Not completed',
  refunded: 'Refunded',
};

const getCentroid = (centroid: any) => {
  if (centroid && 'lat' in centroid) return { lat: centroid.lat, lng: centroid.lng };
  if (centroid?.type === 'Point' && Array.isArray(centroid.coordinates)) {
    return { lat: centroid.coordinates[1], lng: centroid.coordinates[0] };
  }
  return null;
};

const receiptOf = (bill: Bill) =>
  bill.status === 'completed' && bill.processor_ref && !bill.processor_ref.startsWith('ws_CO_') ? bill.processor_ref : null;

const ROW = 'grid grid-cols-[96px_minmax(0,1fr)] gap-2 px-3 py-1.5';
const SECTION = 'bg-hover-surface px-3 py-1 text-[10px] font-medium tracking-wide text-text-tertiary uppercase';

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className={ROW}>
      <dt className="text-text-tertiary text-xs">{label}</dt>
      <dd className={`min-w-0 break-words text-text-primary ${mono ? 'font-mono text-[11.5px]' : 'text-xs'}`}>{value}</dd>
    </div>
  );
}

export function ParcelDetailsCard({ parcel, onClose, onZoom }: ParcelDetailsCardProps) {
  const [copied, setCopied] = useState(false);
  const [owner, setOwner] = useState<OwnerDetails | null>(null);
  const [bills, setBills] = useState<Bill[] | null>(null);

  const p = parcel?.properties ? { ...parcel.properties, id: parcel.id } : parcel;
  const parcelRef: string | null = p?.parcel_ref ?? null;
  const parcelId: string | null = p?.parcel_id ?? p?.id ?? null;
  const ownerId: string | null = p?.owner_id ?? p?.owner_user ?? null;
  const paymentStatus = usePaymentStatus(parcelRef);

  useEffect(() => {
    if (!parcel) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [parcel, onClose]);

  const loadDetails = useCallback(async () => {
    setCopied(false);
    setOwner(null);
    setBills(null);
    if (!parcelId) return;
    const [ownerData, billData] = await Promise.all([
      ownerId ? backendJson<OwnerDetails>(`/api/users/${ownerId}/`).catch(() => null) : Promise.resolve(null),
      backendJson<{ results: Bill[] }>(`/api/payments/?parcel=${parcelId}&ordering=-payment_year`).catch(() => ({ results: [] })),
    ]);
    setOwner(ownerData);
    setBills(billData.results);
  }, [parcelId, ownerId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (!parcel) return null;

  const props = p.custom_props || p.props || {};
  const areaM2 = Number(p.area_m2 || p.area || 0);
  const ward = p.ward || props.ward;
  const centroid = getCentroid(p.centroid);
  const coordinates = centroid ? `${centroid.lat.toFixed(6)}, ${centroid.lng.toFixed(6)}` : null;
  const payment = PAYMENT_COLORS[paymentStatus] ?? PAYMENT_COLORS.not_billed;
  const status = String(p.status || 'active').toLowerCase();
  const registration = props.REG_SECTIO;
  const dash = '—';

  const copyCoordinates = async () => {
    if (!coordinates) return;
    await navigator.clipboard.writeText(coordinates);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="border-border-default border-[0.5px] text-sm">
      <div className="border-border-default flex items-center justify-between gap-2 border-b-[0.5px] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-semibold text-text-primary">Parcel {p.parcel_ref}</h3>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: payment.color }} />
            {new Date().getFullYear()} · {payment.label}
          </span>
        </div>
        <button onClick={onClose} aria-label="Close parcel details" className="text-text-tertiary hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      <dl className="divide-border-default divide-y-[0.5px]">
        <div className={SECTION}>Parcel</div>
        <Row label="Plot no." value={p.parcel_ref} />
        {registration && <Row label="Title ref." value={`${registration}/${p.parcel_ref}`} />}
        <Row label="Status" value={<span className="capitalize">{status}</span>} />
        <Row label="Ward" value={ward ? titleCase(String(ward)) : dash} />
        <Row label="Sub-county" value={p.sub_county || dash} />
        <Row label="County" value={p.county || dash} />
        <Row label="Land use" value={p.land_use ? titleCase(String(p.land_use)) : dash} />
        <Row label="Area" value={`${(areaM2 / 10000).toFixed(2)} ha · ${Math.round(areaM2).toLocaleString()} m²`} />
        <Row label="Centroid" value={coordinates ?? dash} mono />

        <div className={SECTION}>Owner</div>
        <Row label="Name" value={p.owner_username || 'Unallocated'} />
        <Row label="Phone" value={owner?.phone || dash} />
        <Row label="Email" value={owner?.email || dash} />
        <Row label="National ID" value={owner?.national_id || dash} />
        <Row
          label="Last sign-in"
          value={owner?.last_login ? new Date(owner.last_login).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : dash}
        />

        <div className={SECTION}>Rates bills</div>
        {bills?.length ? (
          bills.map((bill) => (
            <Row
              key={bill.payment_id}
              label={String(bill.payment_year ?? dash)}
              value={
                <>
                  {formatMoney(bill.amount)} · {BILL_LABELS[bill.status] ?? bill.status}
                  {receiptOf(bill) && <span className="text-text-tertiary"> · {receiptOf(bill)}</span>}
                  {bill.days_overdue ? <span className="text-red-600 dark:text-red-400"> · {bill.days_overdue}d overdue</span> : null}
                </>
              }
            />
          ))
        ) : (
          <Row label="Bills" value={bills ? 'None issued' : dash} />
        )}
      </dl>

      <div className="border-border-default flex gap-2 border-t-[0.5px] p-2">
        {onZoom && (
          <button
            onClick={() => onZoom(p.parcel_ref)}
            className="border-border-default hover:bg-hover-surface flex flex-1 items-center justify-center gap-1.5 border-[0.5px] px-3 py-1.5 text-sm text-text-primary"
          >
            <Crosshair className="h-4 w-4" />
            Zoom to parcel
          </button>
        )}
        {coordinates && (
          <button
            onClick={copyCoordinates}
            aria-label="Copy coordinates"
            title="Copy coordinates"
            className="border-border-default hover:bg-hover-surface flex items-center justify-center border-[0.5px] px-3 py-1.5 text-text-secondary"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>

      <DeleteParcelAction
        parcelId={String(p.parcel_id ?? parcelId)}
        parcelRef={String(p.parcel_ref)}
        onDeleted={onClose}
      />
    </section>
  );
}
