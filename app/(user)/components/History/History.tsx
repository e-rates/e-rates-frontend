'use client';

import { useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { columns, type HistoryRecord } from './historyTypes';
import { authService } from '@/lib/auth';

const History = () => {
  const [data, setData] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await authService.getValidAccessToken();
        
        if (!token) {
          // No token, just show empty history without error
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('/api/user/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          // Don't show error for not implemented yet
          if (result.error === 'Backend API not yet implemented') {
            setData([]);
          } else {
            throw new Error(result.error || 'Failed to fetch history');
          }
        } else {
          setData(result.data || []);
        }
      } catch (err) {
        // Silently fail - history is optional
        console.log('History not available:', err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          Loading history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col space-y-4 pt-2">
      <div className="px-4">
        <h1 className="text-lg font-semibold tracking-tight">History</h1>
      </div>

      {/* Table */}
      <div>
        <div className="squircle-lg overflow-hidden border border-neutral-200 shadow-sm dark:border-neutral-800">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="grid h-12 w-full grid-cols-4 place-items-start border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="flex items-center justify-center px-[7px] text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="bg-white dark:bg-neutral-950">
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`grid h-14 w-full grid-cols-4 place-items-start border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800/50 dark:hover:bg-neutral-900/30 ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-neutral-950'
                      : 'bg-neutral-50/50 dark:bg-neutral-900/20'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="flex items-center px-[7px] text-sm text-neutral-900 dark:text-neutral-100"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
