'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { BUTTON } from '../../components/forms/Section';
import { backendFetch, backendJson } from '@/lib/backend';
import { authService } from '@/lib/auth';

interface DeletionRequest {
  request_id: string;
  parcel_ref: string;
  county: string;
  ward: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by_username: string;
  reviewed_by_username: string | null;
  reviewed_at: string | null;
  decision_note: string;
  created_at: string;
}

const HEAD = 'border-border-default text-left text-[11px] font-medium tracking-wide text-text-tertiary uppercase';
const CELL = 'px-5 py-3 align-top';

const STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  pending: { label: 'Awaiting review', dot: '#525252' },
  approved: { label: 'Approved', dot: '#dc2626' },
  rejected: { label: 'Kept', dot: '#16a34a' },
};

const when = (iso: string) => new Date(iso).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });

export default function DeletionRequestsPage() {
  const [requests, setRequests] = useState<DeletionRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const isOwner = authService.isPlatformOwner();

  const load = useCallback(async () => {
    try {
      const page = await backendJson<{ results: DeletionRequest[] }>(
        '/api/parcel-deletion-requests/?ordering=-created_at'
      );
      setRequests(page.results);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (request: DeletionRequest, approve: boolean) => {
    setBusy(request.request_id);
    try {
      const response = await backendFetch(
        `/api/parcel-deletion-requests/${request.request_id}/${approve ? 'approve' : 'reject'}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision_note: notes[request.request_id] ?? '' }),
        }
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error || 'Could not record that decision.');
        return;
      }
      toast.success(
        approve ? `Plot ${request.parcel_ref} deleted.` : `Plot ${request.parcel_ref} kept.`
      );
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const pending = (requests ?? []).filter((r) => r.status === 'pending');

  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto px-6 pb-10">
      <div className="border-border-default border-b-[0.5px] py-6">
        <h1 className="text-text-primary text-2xl font-semibold">Plot deletion requests</h1>
        <p className="text-text-tertiary mt-1 text-sm">
          {requests
            ? `${pending.length} awaiting review · ${requests.length} in total`
            : 'Loading…'}
        </p>
      </div>

      {error ? (
        <EmptyState icon={Trash2} title="Could not load requests" message={error} />
      ) : requests && requests.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Nothing to review"
          message="Officials can delete unallocated plots themselves. Anything allocated or billed shows up here."
        />
      ) : (
        <table className="w-full text-sm">
          <thead className={HEAD}>
            <tr className="border-border-default border-b-[0.5px]">
              <th className={CELL}>Plot</th>
              <th className={CELL}>Reason</th>
              <th className={CELL}>Requested</th>
              <th className={CELL}>Status</th>
              {isOwner && <th className={`${CELL} text-right`}>Decision</th>}
            </tr>
          </thead>
          <tbody className="divide-border-default divide-y-[0.5px]">
            {(requests ?? []).map((request) => {
              const status = STATUS_LABELS[request.status];
              return (
                <tr key={request.request_id} className="hover:bg-hover-surface">
                  <td className={`${CELL} font-medium text-text-primary`}>
                    {request.parcel_ref}
                    <span className="text-text-tertiary block text-xs font-normal">
                      {[request.ward, request.county].filter(Boolean).join(' · ')}
                    </span>
                  </td>
                  <td className={`${CELL} max-w-md text-text-secondary`}>{request.reason}</td>
                  <td className={`${CELL} text-text-secondary`}>
                    {request.requested_by_username}
                    <span className="text-text-tertiary block text-xs">{when(request.created_at)}</span>
                  </td>
                  <td className={CELL}>
                    <span className="inline-flex items-center gap-2 text-text-secondary">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                      {status.label}
                    </span>
                    {request.reviewed_by_username && (
                      <span className="text-text-tertiary block text-xs">
                        {request.reviewed_by_username}
                        {request.decision_note ? ` · ${request.decision_note}` : ''}
                      </span>
                    )}
                  </td>
                  {isOwner && (
                    <td className={`${CELL} text-right`}>
                      {request.status === 'pending' ? (
                        <div className="flex flex-col items-end gap-2">
                          <input
                            value={notes[request.request_id] ?? ''}
                            onChange={(e) =>
                              setNotes({ ...notes, [request.request_id]: e.target.value })
                            }
                            placeholder="Note (optional)"
                            className="border-border-default focus:border-text-tertiary w-48 border-[0.5px] px-2 py-1 text-xs text-text-primary focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => decide(request, true)}
                              disabled={busy === request.request_id}
                              className={`${BUTTON} border-red-600 text-red-700`}
                            >
                              Delete plot
                            </button>
                            <button
                              onClick={() => decide(request, false)}
                              disabled={busy === request.request_id}
                              className={BUTTON}
                            >
                              Keep
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-tertiary text-xs">
                          {request.reviewed_at ? when(request.reviewed_at) : '—'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
