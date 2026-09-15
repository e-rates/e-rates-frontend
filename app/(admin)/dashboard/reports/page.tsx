'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendFetch } from '@/lib/backend';
import { downloadBlob } from '@/lib/format';
import { ratingYears } from '@/lib/rates';

type Format = 'pdf' | 'xlsx';
type ReportKey = 'collections' | 'arrears' | 'register';

const control = 'border-border-default bg-main-bg border-[0.5px] px-2.5 py-1.5 text-sm text-text-primary';
const button =
  'border-border-default hover:bg-hover-surface flex items-center gap-2 border-[0.5px] px-3 py-1.5 text-sm text-text-primary transition-colors disabled:cursor-wait disabled:opacity-50';

const isoToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
const firstOfMonth = () => `${isoToday().slice(0, 8)}01`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-tertiary">
      {label}
      {children}
    </label>
  );
}

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [asOf, setAsOf] = useState(isoToday());
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(isoToday());
  const [busy, setBusy] = useState<string | null>(null);

  const download = async (report: ReportKey, format: Format) => {
    const query = new URLSearchParams({ report, file_format: format });
    if (report === 'collections') query.set('year', String(year));
    if (report === 'arrears') query.set('as_of', asOf);
    if (report === 'register') {
      query.set('from', from);
      query.set('to', to);
    }
    setBusy(`${report}-${format}`);
    try {
      const res = await backendFetch(`/api/reports/download/?${query}`);
      if (!res.ok) {
        let errMessage = `Failed to download report (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.detail || errData.error) errMessage = errData.detail || errData.error;
        } catch {}
        throw new Error(errMessage);
      }
      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition') || '';
      let filename = `${report}-${format === 'pdf' ? isoToday() : year}.${format}`;
      const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i);
      if (match && match[1]) {
        filename = match[1];
      }
      downloadBlob(blob, filename);
    } catch (e) {
      const message = (e as Error).message;
      toast.error(
        message === 'Failed to fetch'
          ? 'Could not reach the server. Check that the backend is running, then try again.'
          : message
      );
    } finally {
      setBusy(null);
    }
  };

  const reports: { key: ReportKey; title: string; description: string; includes: string; fields: React.ReactNode }[] = [
    {
      key: 'collections',
      title: 'Collections summary',
      description: 'What was billed and collected for a rating year, by ward and sub-county, with the collection rate.',
      includes: 'Totals · by ward · by month paid',
      fields: (
        <Field label="Rating year">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={control}>
            {ratingYears().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
      ),
    },
    {
      key: 'arrears',
      title: 'Defaulters and arrears',
      description: 'Every unpaid bill past its deadline, with owner contacts, grouped by how long it has been overdue.',
      includes: 'Aging 1–30 / 31–60 / 61–90 / 90+ days · by ward · defaulter list',
      fields: (
        <Field label="Overdue as of">
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className={control} />
        </Field>
      ),
    },
    {
      key: 'register',
      title: 'Payment register',
      description: 'Every confirmed payment in a period with its M-Pesa receipt, for reconciling against the M-Pesa statement.',
      includes: 'Receipt · plot · payer · paying phone · amount',
      fields: (
        <div className="flex items-end gap-2">
          <Field label="From">
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={control} />
          </Field>
          <Field label="To">
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={control} />
          </Field>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-main-bg flex h-full w-full flex-col overflow-y-auto">
      <div className="border-border-default border-b-[0.5px] px-6 py-4">
        <h1 className="text-lg font-semibold text-text-primary">Reports</h1>
        <p className="mt-0.5 text-sm text-text-tertiary">
          Generated from live data on the server. PDF for printing and sharing, Excel for further analysis.
        </p>
      </div>

      <ul className="divide-border-default border-border-default divide-y-[0.5px] border-b-[0.5px]">
        {reports.map((r) => (
          <li key={r.key} className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary">{r.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">{r.description}</p>
              <p className="mt-1 text-xs text-text-tertiary">{r.includes}</p>
            </div>
            <div>{r.fields}</div>
            <div className="flex gap-2">
              {(['pdf', 'xlsx'] as Format[]).map((format) => {
                const id = `${r.key}-${format}`;
                const Icon = format === 'pdf' ? FileText : FileSpreadsheet;
                return (
                  <button key={format} onClick={() => download(r.key, format)} disabled={busy !== null} className={button}>
                    {busy === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                    {format === 'pdf' ? 'PDF' : 'Excel'}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
