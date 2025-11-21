'use client';

import React from 'react';
import { Button } from '@/app/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

export function TablePagination({
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
}: TablePaginationProps) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex flex-col gap-4 border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
            {/* Results count */}
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing{' '}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {startItem}
                </span>{' '}
                to{' '}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {endItem}
                </span>{' '}
                of{' '}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {totalCount}
                </span>{' '}
                results
            </div>

            <div className="flex items-center gap-4">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Rows per page:
                    </span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Page{' '}
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                {currentPage}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                {totalPages}
                            </span>
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
