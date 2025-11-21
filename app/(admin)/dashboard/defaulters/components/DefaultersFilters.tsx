'use client';

import React, { useState } from 'react';
import { DefaultersFilters } from '../types';
import { Input } from '@/app/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/app/components/ui/collapsible';

interface DefaultersFiltersProps {
    filters: DefaultersFilters;
    onFiltersChange: (filters: DefaultersFilters) => void;
    onClearFilters: () => void;
}

export function DefaultersFiltersComponent({
    filters,
    onFiltersChange,
    onClearFilters,
}: DefaultersFiltersProps) {
    const [isOpen, setIsOpen] = useState(true);

    const updateFilter = (key: keyof DefaultersFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value || undefined,
        });
    };

    const removeFilter = (key: keyof DefaultersFilters) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFiltersChange(newFilters);
    };

    const activeFiltersCount = Object.keys(filters).filter(
        (key) => key !== 'page' && key !== 'page_size' && filters[key as keyof DefaultersFilters]
    ).length;

    return (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-neutral-500" />
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                            Filters
                        </h3>
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary">{activeFiltersCount}</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearFilters}
                                className="h-8 text-xs"
                            >
                                Clear All
                            </Button>
                        )}
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                {isOpen ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </div>

                <CollapsibleContent>
                    <div className="p-4 space-y-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Search
                            </label>
                            {/* <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    placeholder="Username, email, phone, or parcel ref..."
                                    value={filters.search || ''}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div> */}
                        </div>

                        {/* Days Overdue Range */}
                        <div className="grid w-full grid-cols-4 bg-amber-500 gap-4 sm:grid-cols-2">
                            <div className="space-y-2 col-span-1 bg-rose-500">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Min Days Overdue
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 30"
                                    value={filters.min_days_overdue || ''}
                                    onChange={(e) =>
                                        updateFilter('min_days_overdue', e.target.value ? Number(e.target.value) : undefined)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Max Days Overdue
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 90"
                                    value={filters.max_days_overdue || ''}
                                    onChange={(e) =>
                                        updateFilter('max_days_overdue', e.target.value ? Number(e.target.value) : undefined)
                                    }
                                />
                            </div>
                        </div>

                        {/* Amount Range */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Min Amount
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 5000"
                                    value={filters.min_amount || ''}
                                    onChange={(e) =>
                                        updateFilter('min_amount', e.target.value ? Number(e.target.value) : undefined)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Currency
                                </label>
                                <Select
                                    value={filters.currency || ''}
                                    onValueChange={(value) => updateFilter('currency', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="KES">KES</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Location Filters */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    County
                                </label>
                                <Input
                                    placeholder="e.g., Nairobi"
                                    value={filters.county || ''}
                                    onChange={(e) => updateFilter('county', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Sub County
                                </label>
                                <Input
                                    placeholder="e.g., Westlands"
                                    value={filters.sub_county || ''}
                                    onChange={(e) => updateFilter('sub_county', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Ward
                                </label>
                                <Input
                                    placeholder="e.g., Westlands"
                                    value={filters.ward || ''}
                                    onChange={(e) => updateFilter('ward', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFiltersCount > 0 && (
                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Active Filters
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {filters.search && (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer gap-1"
                                            onClick={() => removeFilter('search')}
                                        >
                                            Search: {filters.search}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    )}
                                    {filters.min_days_overdue && (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer gap-1"
                                            onClick={() => removeFilter('min_days_overdue')}
                                        >
                                            Min Days: {filters.min_days_overdue}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    )}
                                    {filters.max_days_overdue && (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer gap-1"
                                            onClick={() => removeFilter('max_days_overdue')}
                                        >
                                            Max Days: {filters.max_days_overdue}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    )}
                                    {filters.min_amount && (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer gap-1"
                                            onClick={() => removeFilter('min_amount')}
                                        >
                                            Min Amount: {filters.min_amount}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    )}
                                    {filters.currency && (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer gap-1"
                                            onClick={() => removeFilter('currency')}
                                        >
                                            Currency: {filters.currency}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    )}
                                    {filters.county && (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer gap-1"
                                            onClick={() => removeFilter('county')}
                                        >
                                            County: {filters.county}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    )}
                                    {filters.sub_county && (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer gap-1"
                                            onClick={() => removeFilter('sub_county')}
                                        >
                                            Sub County: {filters.sub_county}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    )}
                                    {filters.ward && (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer gap-1"
                                            onClick={() => removeFilter('ward')}
                                        >
                                            Ward: {filters.ward}
                                            <X className="h-3 w-3" />
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
