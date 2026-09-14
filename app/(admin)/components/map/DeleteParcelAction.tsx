'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendFetch } from '@/lib/backend';
import { authService } from '@/lib/auth';

const BUTTON =
  'border-border-default hover:bg-hover-surface flex items-center justify-center gap-1.5 border-[0.5px] px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40';

type Stage = 'idle' | 'confirm' | 'escalate';

/** Delete a plot outright when it is clean, otherwise raise a request for the platform owner. */
export function DeleteParcelAction({
  parcelId,
  parcelRef,
  onDeleted,
}: {
  parcelId: string;
  parcelRef: string;
  onDeleted: () => void;
}) {
  const [stage, setStage] = useState<Stage>('idle');
  const [blockedReason, setBlockedReason] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  if (!authService.isAdmin()) return null;

  const attemptDelete = async () => {
    setBusy(true);
    try {
      const response = await backendFetch(`/api/parcels/${parcelId}/`, { method: 'DELETE' });
      if (response.status === 204) {
        toast.success(`Plot ${parcelRef} deleted.`);
        onDeleted();
        return;
      }
      const body = await response.json().catch(() => ({}));
      setBlockedReason(body.error || 'This plot cannot be deleted.');
      setStage(body.can_request ? 'escalate' : 'idle');
      if (!body.can_request) toast.error(body.error || 'This plot cannot be deleted.');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submitRequest = async () => {
    setBusy(true);
    try {
      const response = await backendFetch(`/api/parcels/${parcelId}/request-deletion/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error || body.reason?.[0] || 'Could not send the request.');
        return;
      }
      toast.success('Sent to the platform owner for approval.');
      setStage('idle');
      setReason('');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (stage === 'confirm') {
    return (
      <div className="border-border-default space-y-2 border-t-[0.5px] p-3">
        <p className="text-sm text-text-primary">Delete plot {parcelRef}?</p>
        <p className="text-xs text-text-tertiary">
          Only plots that were never allocated or billed can be removed here.
        </p>
        <div className="flex gap-2">
          <button onClick={attemptDelete} disabled={busy} className={`${BUTTON} flex-1 border-red-600 text-red-700`}>
            {busy ? 'Checking…' : 'Yes, delete'}
          </button>
          <button onClick={() => setStage('idle')} disabled={busy} className={`${BUTTON} flex-1 text-text-primary`}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'escalate') {
    return (
      <div className="border-border-default space-y-2 border-t-[0.5px] p-3">
        <p className="text-sm font-medium text-text-primary">Ask the platform owner</p>
        <p className="text-xs text-text-tertiary">{blockedReason}</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Why should this plot be removed? e.g. duplicated by a bad shapefile import"
          className="border-border-default focus:border-text-tertiary w-full resize-none border-[0.5px] px-2 py-1.5 text-sm text-text-primary focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={submitRequest}
            disabled={busy || reason.trim().length < 10}
            className={`${BUTTON} flex-1 bg-text-primary text-main-bg`}
          >
            {busy ? 'Sending…' : 'Send request'}
          </button>
          <button
            onClick={() => {
              setStage('idle');
              setReason('');
            }}
            disabled={busy}
            className={`${BUTTON} flex-1 text-text-primary`}
          >
            Cancel
          </button>
        </div>
        {reason.trim().length > 0 && reason.trim().length < 10 && (
          <p className="text-xs text-text-tertiary">Give a bit more detail — at least 10 characters.</p>
        )}
      </div>
    );
  }

  return (
    <div className="border-border-default border-t-[0.5px] p-2">
      <button onClick={() => setStage('confirm')} className={`${BUTTON} w-full text-red-700`}>
        <Trash2 className="h-4 w-4" />
        Delete plot
      </button>
    </div>
  );
}
