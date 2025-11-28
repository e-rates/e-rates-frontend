'use client';

import React, { useState } from 'react';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { useMapContext } from '../../context/MapContext';
import { useSpring, animated } from '@react-spring/web';
import toast from 'react-hot-toast';

const CoordinateSearch = () => {
  const [minEastings, setMinEastings] = useState('');
  const [maxEastings, setMaxEastings] = useState('');
  const [minNorthings, setMinNorthings] = useState('');
  const [maxNorthings, setMaxNorthings] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const { mapRef } = useMapContext();

  const contentProps = useSpring({
    height: isOpen ? 'auto' : 0,
    opacity: isOpen ? 1 : 0,
    overflow: 'hidden',
    config: { tension: 300, friction: 20 },
  });

  const iconProps = useSpring({
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { tension: 300, friction: 20 },
  });

  const handleSearch = () => {
    // Validate inputs
    const minEast = parseFloat(minEastings);
    const maxEast = parseFloat(maxEastings);
    const minNorth = parseFloat(minNorthings);
    const maxNorth = parseFloat(maxNorthings);

    if (
      isNaN(minEast) ||
      isNaN(maxEast) ||
      isNaN(minNorth) ||
      isNaN(maxNorth)
    ) {
      toast.error('Please enter valid coordinate values');
      return;
    }

    // Validate that min < max
    if (minEast >= maxEast) {
      toast.error('Min Eastings must be less than Max Eastings');
      return;
    }

    if (minNorth >= maxNorth) {
      toast.error('Min Northings must be less than Max Northings');
      return;
    }

    // Validate Kenya bounds
    if (minEast < 33.5 || maxEast > 42.0) {
      toast.error('Eastings out of bounds (33.5° - 42.0°E)');
      return;
    }

    if (minNorth < -5.0 || maxNorth > 5.0) {
      toast.error('Northings out of bounds (-5.0° to 5.0°)');
      return;
    }

    // Calculate center and fit bounds
    if (mapRef.current) {
      const bounds: [[number, number], [number, number]] = [
        [minNorth, minEast],
        [maxNorth, maxEast],
      ];
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        duration: 2,
      });

      // Trigger resize event after fitBounds animation completes to redraw grid
      setTimeout(() => {
        mapRef.current?.fire('resize');
      }, 2100);

      toast.success('Map bounds updated');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex w-full flex-col space-y-2 border-b-[0.5px] border-neutral-600/80 pb-2 border-dashed">
      <div 
        className="flex cursor-pointer items-center justify-between px-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="text-regular-md">Coordinate Search</p>
        <animated.div style={iconProps}>
          <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
        </animated.div>
      </div>

      <animated.div style={contentProps}>
        <div className="squircle-3xl dark:bg-panel-bg flex w-full flex-col gap-3 bg-gray-100 p-3">
          {/* Eastings Inputs */}
          <div className="flex flex-col space-y-1">
            <label className="text-body-sm text-muted-foreground">
              Eastings (Longitude °E)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={minEastings}
                onChange={(e) => setMinEastings(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Min: 33.5"
                className="dark:bg-elevated-surface dark:border-border-default w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                value={maxEastings}
                onChange={(e) => setMaxEastings(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Max: 42.0"
                className="dark:bg-elevated-surface dark:border-border-default w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Northings Inputs */}
          <div className="flex flex-col space-y-1">
            <label className="text-body-sm text-muted-foreground">
              Northings (Latitude °)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={minNorthings}
                onChange={(e) => setMinNorthings(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Min: -5.0"
                className="dark:bg-elevated-surface dark:border-border-default w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                value={maxNorthings}
                onChange={(e) => setMaxNorthings(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Max: 5.0"
                className="dark:bg-elevated-surface dark:border-border-default w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="squircle-lg flex w-full items-center justify-center gap-2 bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            <MapPin size={16} />
            Fit to Bounds
          </button>
        </div>
      </animated.div>
    </div>
  );
};

export default CoordinateSearch;
