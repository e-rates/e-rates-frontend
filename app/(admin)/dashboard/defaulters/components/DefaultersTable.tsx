'use client';

import React, { useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
    ExpandedState,
    getExpandedRowModel,
} from '@tanstack/react-table';
import { Defaulter } from '../types';
import { Badge } from '@/app/components/ui/badge';
import {
    ChevronDown,
    ChevronRight,
    MapPin,
    Calendar,
    DollarSign,
    User,
    Mail,
    Phone,
    FileText,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface DefaultersTableProps {
    data: Defaulter[];
    isLoading?: boolean;
}

// Column definitions
const columns: ColumnDef<Defaulter>[] = [
    {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
            return row.getCanExpand() ? (
                <button
                    onClick={row.getToggleExpandedHandler()}
                    className="cursor-pointer p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </button>
            ) : null;
        },
        size: 40,
    },
    {
        accessorKey: 'username',
        header: 'User',
        cell: ({ row }) => {
            const defaulter = row.original;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {defaulter.username}
                    </span>
                    <span className="text-xs text-neutral-500">{defaulter.email}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {row.original.phone}
            </span>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
            const defaulter = row.original;
            return (
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {defaulter.currency} {Number(defaulter.amount).toLocaleString()}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'days_overdue',
        header: 'Days Overdue',
        cell: ({ row }) => {
            const days = row.original.days_overdue;
            let variant: 'warning' | 'destructive' = 'warning';
            if (days > 60) variant = 'destructive';

            return (
                <Badge variant={variant} className="font-mono">
                    {days} days
                </Badge>
            );
        },
    },
    {
        accessorKey: 'deadline',
        header: 'Deadline',
        cell: ({ row }) => {
            const date = new Date(row.original.deadline);
            return (
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {date.toLocaleDateString()}
                </span>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            const variant =
                status === 'pending'
                    ? 'pending'
                    : status === 'paid'
                        ? 'paid'
                        : 'overdue';
            return (
                <Badge variant={variant as any} className="capitalize">
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'parcels',
        header: 'Parcels',
        cell: ({ row }) => {
            const count = row.original.parcels.length;
            return (
                <Badge variant="secondary">
                    {count} {count === 1 ? 'parcel' : 'parcels'}
                </Badge>
            );
        },
    },
];

export function DefaultersTable({ data, isLoading }: DefaultersTableProps) {
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getExpandedRowModel: getExpandedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getRowCanExpand: () => true,
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400"></div>
                    <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                        Loading defaulters...
                    </p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="text-center">
                    <User className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        No defaulters found
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        Try adjusting your filters to see more results.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {table.getRowModel().rows.map((row) => (
                            <React.Fragment key={row.id}>
                                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-4 py-3 text-sm"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                {row.getIsExpanded() && (
                                    <tr>
                                        <td colSpan={columns.length} className="bg-neutral-50 dark:bg-neutral-800/20">
                                            <div className="p-4">
                                                <ExpandedRowContent defaulter={row.original} />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Expanded row content showing parcel details
function ExpandedRowContent({ defaulter }: { defaulter: Defaulter }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Payment Details */}
            <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Payment Details
                </h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-neutral-500" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                            Payment ID:
                        </span>
                        <span className="font-mono text-neutral-900 dark:text-neutral-100">
                            {defaulter.payment_id}
                        </span>
                    </div>
                    {defaulter.metadata?.invoice_number && (
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-neutral-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                Invoice:
                            </span>
                            <span className="font-mono text-neutral-900 dark:text-neutral-100">
                                {defaulter.metadata.invoice_number}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                            Created:
                        </span>
                        <span className="text-neutral-900 dark:text-neutral-100">
                            {new Date(defaulter.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Parcels */}
            <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Associated Parcels ({defaulter.parcels.length})
                </h4>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                    {defaulter.parcels.map((parcel, idx) => (
                        <div
                            key={idx}
                            className="rounded border border-neutral-200 bg-neutral-50 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800/50"
                        >
                            <div className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                                {parcel.parcel_ref}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                                <MapPin className="h-3 w-3" />
                                {parcel.ward}, {parcel.sub_county}, {parcel.county}
                            </div>
                            <div className="mt-0.5 text-xs text-neutral-500">
                                {parcel.centroid.lat.toFixed(4)}, {parcel.centroid.lon.toFixed(4)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
