import React, { useState, useEffect } from 'react';
import { QuickToolsItems, QuickToolItem } from './QuickToolsData';
import { useSpring, animated } from '@react-spring/web';
import { useMapContext } from '../../context/MapContext';
import axios from 'axios';
import { authService } from '@/lib/auth';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Search } from 'lucide-react';

const QuickToolsBar = () => {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [items, setItems] = useState(QuickToolsItems);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{parcel_ref: string, owner_username: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { zoomIn, zoomOut, resetZoom, locateParcel } = useMapContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search for suggestions (local DB first)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchValue.length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        // Try local DB first
        const { ParcelQueries } = await import('@/lib/db/queries');
        let parcels = await ParcelQueries.search(searchValue);
        if (!parcels || parcels.length === 0) {
          // fallback to backend
          const token = await authService.getValidAccessToken();
          if (!token) return;
          const response = await axios.get(
            `http://127.0.0.1:8080/api/parcels/geojson/?search=${encodeURIComponent(searchValue)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          parcels = response.data.features?.map((f: any) => ({
            parcel_ref: f.properties.parcel_ref,
            owner_username: f.properties.owner_username || 'No owner',
          })) || [];
        } else {
          parcels = parcels.map((p: any) => ({
            parcel_ref: p.parcel_number,
            owner_username: p.owner_name || 'No owner',
          }));
        }
        setSearchSuggestions(parcels.slice(0, 5));
        setShowSuggestions(parcels.length > 0);
      } catch (error) {
        console.error('Search suggestions error:', error);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchValue]);

  const handleClick = (index: number) => {
    setClickedIndex(index);
    setActiveIndex(index);
    setTimeout(() => setClickedIndex(null), 300);

    // Handle tool actions
    const action = items[index].action;
    switch (action) {
      case 'zoom-in':
        zoomIn();
        break;
      case 'zoom-out':
        zoomOut();
        break;
      case 'reset-zoom':
        resetZoom();
        break;
      case 'share':
        // Handle share action
        break;
      case 'print':
        // Handle print action
        window.print();
        break;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items: typeof QuickToolsItems) => {
        const oldIndex = items.findIndex(
          (item: QuickToolItem) => item.name === active.id
        );
        const newIndex = items.findIndex(
          (item: QuickToolItem) => item.name === over.id
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center gap-3 px-4">
        {/* Search skeleton */}
        <div className="dark:bg-elevated-surface h-[35px] flex-1 animate-pulse rounded-full bg-gray-200" />
        {/* Tool skeletons */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="dark:bg-elevated-surface h-[35px] w-[35px] animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full items-center gap-3 px-4"
      style={{
        animation: 'blurIn 0.4s ease-out forwards',
        position: 'relative',
        zIndex: 100000,
      }}
    >
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search
          className={`absolute top-1/2 left-3 -translate-y-1/2 transition-colors ${
            searchFocused
              ? 'text-black dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
          }`}
          size={18}
        />
        <input
          type="text"
          placeholder="search parcel by number or owner..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchValue.trim()) {
              locateParcel(searchValue.trim());
              setSearchValue('');
              setShowSuggestions(false);
            }
          }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="squircle-full dark:border-border-default dark:bg-elevated-surface h-[35px] w-full border border-gray-200 bg-white pr-4 pl-10 text-sm transition-all outline-none placeholder:text-gray-400 focus:border-gray-400 dark:placeholder:text-gray-500 dark:focus:border-gray-600"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800" style={{zIndex: 100000}}>
            {searchSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onClick={() => {
                  locateParcel(suggestion.parcel_ref);
                  setSearchValue('');
                  setShowSuggestions(false);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Parcel {suggestion.parcel_ref}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Owner: {suggestion.owner_username}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tools */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-center gap-2">
          <SortableContext
            items={items.map((item: QuickToolItem) => item.name)}
            strategy={horizontalListSortingStrategy}
          >
            {items.map((item: QuickToolItem, index: number) => (
              <QuickToolItem
                key={item.name}
                item={item}
                index={index}
                isActive={activeIndex === index}
                isHovered={hoveredIndex === index}
                isClicked={clickedIndex === index}
                onHover={() => setHoveredIndex(index)}
                onLeave={() => setHoveredIndex(null)}
                onClick={() => handleClick(index)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <style jsx>{`
        @keyframes blurIn {
          from {
            filter: blur(10px);
            opacity: 0;
          }
          to {
            filter: blur(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

interface QuickToolItemProps {
  item: (typeof QuickToolsItems)[0];
  index: number;
  isActive: boolean;
  isHovered: boolean;
  isClicked: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const QuickToolItem = ({
  item,
  isActive,
  isHovered,
  isClicked,
  onHover,
  onLeave,
  onClick,
}: QuickToolItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.name });

  const springProps = useSpring({
    scale: isClicked ? 0.85 : isDragging ? 1.05 : 1,
    config: {
      tension: 300,
      friction: 10,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      {...attributes}
      {...listeners}
    >
      <animated.div style={springProps} onClick={onClick}>
        <div
          className={`squircle-md flex h-[35px] w-[35px] cursor-grab items-center justify-center transition-all duration-300 active:cursor-grabbing ${
            isActive
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'dark:bg-elevated-surface bg-gray-50 text-gray-700 opacity-50 hover:opacity-75 dark:text-current'
          }`}
        >
          <item.icon size={18} />
        </div>
      </animated.div>
      {isHovered && !isDragging && (
        <div className="squircle-lg text-regular-md absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 bg-black px-3 py-1.5 whitespace-nowrap text-white shadow-lg">
          {item.name}
        </div>
      )}
    </div>
  );
};

export default QuickToolsBar;
