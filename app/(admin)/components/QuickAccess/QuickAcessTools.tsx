import React, { useState, useEffect } from 'react';
import { QuickAccessMenuItems } from './QuickAccessData';
import { useSpring, animated } from '@react-spring/web';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMapContext } from '../../context/MapContext';
import { usePathname } from 'next/navigation';
import CoordinateSearch from './CoordinateSearch';
import { ParcelDetailsCard } from '../map/ParcelDetailsCard';
import { QuickAccessPlaceholder } from './QuickAccessPlaceholder';

import toast from 'react-hot-toast';

const QuickAcessTools = () => {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [items, setItems] = useState(QuickAccessMenuItems);
  const {
    toggleGrid,
    showGrid,
    toggleBaseMap,
    showBaseMap,
    toggleMapLock,
    isMapLocked,
    selectedParcel,
    setSelectedParcel,
    clearHighlights,
    locateParcel,
  } = useMapContext();
  const pathname = usePathname();

  // Check if we're on the parcels-map route
  const isOnParcelsMap = pathname?.includes('/parcels-map');

  // Check if we're on the home page
  const isOnHomePage = pathname?.includes('/home');

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

  const handleClick = (index: number) => {
    setClickedIndex(index);
    setTimeout(() => setClickedIndex(null), 300);

    // Execute action if the item has one
    const item = items[index];
    if (item.action) {
      item.action();
    }

    // Handle Inspector toggle (renamed from Grid)
    if (item.name === 'Inspector' && item.requiresContext) {
      toggleGrid();
      return;
    }

    // Handle BaseMap toggle
    if (item.name === 'BaseMap' && item.requiresContext) {
      toggleBaseMap();
      return;
    }

    // Handle LockView toggle
    if (item.name === 'LockView' && item.requiresContext) {
      toggleMapLock();
      return;
    }

    // Handle Clear Highlights
    if (item.name === 'Clear Highlights' && item.requiresContext) {
      console.log('🖱️ QuickAccess: Clear Highlights clicked');
      clearHighlights();
      toast.success('Highlights cleared');
      return;
    }

    // For non-toggle items, set active index
    setActiveIndex(index);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col space-y-2">
      <div className="px-1">
        <p className="text-regular-md">Quick Access Tools</p>
      </div>

      {/*Quick Access Items  */}
      {!mounted ? (
        <div className="squircle-3xl dark:bg-panel-bg grid h-fit w-full grid-cols-5 place-items-center gap-3 bg-gray-100 px-3 py-3">
          {Array.from({ length: QuickAccessMenuItems.length }).map((_, i) => (
            <div
              key={i}
              className="squircle-md dark:bg-elevated-surface h-[38px] w-[38px] animate-pulse bg-gray-200"
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            animation: 'blurIn 0.4s ease-out forwards',
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="squircle-3xl dark:bg-panel-bg grid h-fit w-full grid-cols-5 place-items-center gap-3 bg-gray-100 px-3 py-3">
              <SortableContext
                items={items.map((item) => item.name)}
                strategy={rectSortingStrategy}
              >
                {items.map((item, index) => {
                  // Check if it's in the bottom row (indices 5-9 for a 5-column grid)
                  const isBottomRow = index >= 5;
                  // Check if it's in the left or right edges
                  const isLeftEdge = index % 5 === 0;
                  const isRightEdge = index % 5 === 4;

                  // Disable Inspector on routes other than home and parcels-map
                  const isInspectorDisabled =
                    item.name === 'Inspector' &&
                    !isOnHomePage &&
                    !isOnParcelsMap;

                  // Check if Inspector, BaseMap, or LockView is active
                  const isInspectorActive =
                    item.name === 'Inspector' && showGrid;
                  const isBaseMapActive =
                    item.name === 'BaseMap' && showBaseMap;
                  const isLockViewActive =
                    item.name === 'LockView' && isMapLocked;

                  return (
                    <QuickAccessItem
                      key={item.name}
                      item={item}
                      index={index}
                      disabled={isInspectorDisabled}
                      isActive={
                        isInspectorActive ||
                        isBaseMapActive ||
                        isLockViewActive ||
                        (activeIndex === index &&
                          item.name !== 'Inspector' &&
                          item.name !== 'BaseMap' &&
                          item.name !== 'LockView')
                      }
                      isHovered={hoveredIndex === index}
                      isClicked={clickedIndex === index}
                      isBottomRow={isBottomRow}
                      isLeftEdge={isLeftEdge}
                      isRightEdge={isRightEdge}
                      onHover={() => setHoveredIndex(index)}
                      onLeave={() => setHoveredIndex(null)}
                      onClick={() => handleClick(index)}
                    />
                  );
                })}
              </SortableContext>
            </div>
          </DndContext>
        </div>
      )}

      {/* Coordinate Search - Only visible on parcels-map route */}
      {isOnParcelsMap && mounted && (
        <div
          className="mt-2"
          style={{
            animation: 'blurIn 0.4s ease-out forwards',
          }}
        >
          <CoordinateSearch />
        </div>
      )}

      {(isOnHomePage || isOnParcelsMap) && selectedParcel && (
        <div className="border-border-default mt-2 border-t-[0.5px] pt-3">
          <ParcelDetailsCard
            parcel={selectedParcel}
            onClose={() => setSelectedParcel(null)}
            onZoom={locateParcel}
          />
        </div>
      )}

      {mounted && !((isOnHomePage || isOnParcelsMap) && selectedParcel) && (
        <QuickAccessPlaceholder pathname={pathname} />
      )}


      {/* Parcel Details Card - Shown when parcel is selected in inspector mode */}

    </div>
  );
};

interface QuickAccessItemProps {
  item: (typeof QuickAccessMenuItems)[0];
  index: number;
  disabled?: boolean;
  isActive: boolean;
  isHovered: boolean;
  isClicked: boolean;
  isBottomRow: boolean;
  isLeftEdge: boolean;
  isRightEdge: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const QuickAccessItem = ({
  item,
  disabled = false,
  isActive,
  isHovered,
  isClicked,
  isBottomRow,
  isLeftEdge,
  isRightEdge,
  onHover,
  onLeave,
  onClick,
}: QuickAccessItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.name });

  const springProps = useSpring({
    scale: isClicked && !disabled ? 0.85 : isDragging ? 1.05 : 1,
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
      onMouseEnter={disabled ? undefined : onHover}
      onMouseLeave={disabled ? undefined : onLeave}
      {...attributes}
      {...listeners}
    >
      <animated.div
        style={springProps}
        onClick={disabled ? undefined : onClick}
      >
        <div
          className={`squircle-md relative flex h-[38px] w-[38px] flex-col items-center justify-center border-[0.5px] transition-all duration-300 ${disabled
            ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 opacity-30 dark:border-gray-700 dark:bg-gray-800'
            : isActive
              ? 'cursor-grab border-[#007AFF] bg-[#007AFF] text-white active:cursor-grabbing'
              : 'dark:border-border-default dark:bg-elevated-surface cursor-grab border-gray-200 bg-gray-50 text-gray-600 opacity-70 hover:opacity-100 hover:text-gray-800 active:cursor-grabbing dark:text-current dark:opacity-50 dark:hover:opacity-75'
            }`}
        >
          <item.icon size={20} />
        </div>
      </animated.div>
      {isHovered && !isDragging && (
        <div
          className={`squircle-lg text-regular-md absolute z-50 bg-black px-3 py-1.5 whitespace-nowrap text-white shadow-lg ${isBottomRow ? 'bottom-full mb-2' : 'top-full mt-2'
            } ${isLeftEdge
              ? 'left-0'
              : isRightEdge
                ? 'right-0'
                : 'left-1/2 -translate-x-1/2'
            }`}
        >
          {item.name}
        </div>
      )}
    </div>
  );
};

export default QuickAcessTools;
