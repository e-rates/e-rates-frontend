'use client';

import React, { useState } from 'react';
import { useMapContext } from '../../context/MapContext';
import { Button } from '@/app/components/ui/button';
import { Map, Filter, Search, X, ChevronDown, Eye, EyeOff } from 'lucide-react';

export const ParcelControls = () => {
  const { showParcels, toggleParcels, parcelFilters, setParcelFilters } =
    useMapContext();

  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState(parcelFilters);

  const handleApplyFilters = () => {
    setParcelFilters(tempFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setTempFilters(emptyFilters);
    setParcelFilters(emptyFilters);
  };

  const hasActiveFilters = Object.values(parcelFilters).some(
    (value) => value !== undefined && value !== ''
  );

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Parcel Toggle */}
      <Button
        variant={showParcels ? 'default' : 'outline'}
        size="sm"
        onClick={toggleParcels}
        className="flex items-center gap-2 border bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
      >
        {showParcels ? <Eye size={16} /> : <EyeOff size={16} />}
        <span className="hidden sm:inline">
          {showParcels ? 'Hide Parcels' : 'Show Parcels'}
        </span>
      </Button>

      {/* Filter Toggle */}
      {showParcels && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 border bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white ${
            hasActiveFilters ? 'border-blue-500 text-blue-700' : ''
          }`}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          )}
          <ChevronDown
            size={14}
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </Button>
      )}

      {/* Filters Panel */}
      {showFilters && showParcels && (
        <div className="squircle-lg min-w-[280px] border bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filter Parcels</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="h-auto p-1"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Search */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Search (Parcel Ref, Owner, etc.)
              </label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={tempFilters.search || ''}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, search: e.target.value })
                  }
                  className="squircle-md w-full border border-gray-300 py-2 pr-3 pl-9 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Area Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Area Name
              </label>
              <input
                type="text"
                placeholder="e.g. Harare, Chitungwiza"
                value={tempFilters.area_name || ''}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, area_name: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Status
              </label>
              <select
                value={tempFilters.status || ''}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    status: e.target.value as 'active' | 'inactive' | undefined,
                  })
                }
                className="squircle-md w-full border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Owner User */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Owner User ID
              </label>
              <input
                type="text"
                placeholder="Enter user ID"
                value={tempFilters.owner_user || ''}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, owner_user: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button size="sm" onClick={handleApplyFilters} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
