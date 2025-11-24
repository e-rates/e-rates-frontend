'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useMapContext } from '../context/MapContext';

export const ParcelSearch = () => {
  const [searchValue, setSearchValue] = useState('');
  const context = useMapContext();
  
  // Don't render if context is not available (Header is outside MapProvider)
  if (!context) {
    return null;
  }

  const { setParcelFilters, parcelFilters } = context;

  const handleSearch = () => {
    if (searchValue.trim()) {
      setParcelFilters({ search: searchValue.trim() });
    } else {
      setParcelFilters({});
    }
  };

  const handleClear = () => {
    setSearchValue('');
    setParcelFilters({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search
          size={18}
          className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
        />
        <input
          type="text"
          placeholder="Search parcel number or owner... (Press Enter)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full border border-gray-300 bg-white py-2 pr-10 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-neutral-800 dark:text-white"
        />
        {(searchValue || parcelFilters.search) && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
