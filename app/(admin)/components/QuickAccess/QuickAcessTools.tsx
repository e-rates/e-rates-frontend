import { Squircle } from '@/app/components/ui/squircle';
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
import { User2Icon } from 'lucide-react';
import { useMapContext } from '../../context/MapContext';
import { usePathname } from 'next/navigation';
import CoordinateSearch from './CoordinateSearch';

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
    setActiveIndex(index);
    setTimeout(() => setClickedIndex(null), 300);

    // Execute action if the item has one
    const item = items[index];
    if (item.action) {
      item.action();
    }

    // Handle Grid toggle
    if (item.name === 'Grid' && item.requiresContext) {
      toggleGrid();
    }

    // Handle BaseMap toggle
    if (item.name === 'BaseMap' && item.requiresContext) {
      toggleBaseMap();
    }

    // Handle LockView toggle
    if (item.name === 'LockView' && item.requiresContext) {
      toggleMapLock();
    }
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
        <div className="dark:bg-panel-bg grid h-fit w-full grid-cols-5 place-items-center gap-3 rounded-3xl bg-gray-100 px-3 py-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="dark:bg-elevated-surface h-[38px] w-[38px] animate-pulse rounded-md bg-gray-200"
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
            <Squircle
              className="dark:bg-panel-bg grid h-fit w-full grid-cols-5 place-items-center gap-3 bg-gray-100 px-3 py-3"
              smoothing={'ios'}
            >
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

                  // Check if Grid, BaseMap, or LockView is active
                  const isGridActive = item.name === 'Grid' && showGrid;
                  const isBaseMapActive =
                    item.name === 'BaseMap' && showBaseMap;
                  const isLockViewActive =
                    item.name === 'LockView' && isMapLocked;

                  return (
                    <QuickAccessItem
                      key={item.name}
                      item={item}
                      index={index}
                      isActive={
                        activeIndex === index ||
                        isGridActive ||
                        isBaseMapActive ||
                        isLockViewActive
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
            </Squircle>
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

      {/* Notifications - Only visible on home page */}
      {isOnHomePage && (
        <div className="border-border-default border-t-[0.5px] pt-2">
          <div>
            <h1 className="text-medium-md tracking-normal">Notifications</h1>
          </div>

          <div className="bg-elevated-surface border-border-default flex h-[60px] w-full flex-row space-x-2 rounded-[12px] border-[0.5px]">
            <div className="flex h-full w-[50px] flex-col items-center justify-center rounded-[12px]">
              <User2Icon />
            </div>
            <div className="flex w-full flex-col">
              {' '}
              <div className="flex flex-row items-center justify-start space-x-2">
                <p className="text-body-md tracking-tight">John Kimathi</p>
                <p className="text-body-sm tracking-tight">Nyeri County</p>
              </div>
              <div className="flex h-full flex-col items-start justify-center">
                <p className="text-regular-md tracking-tight">
                  Payment received for <span className="">John Kimathi</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface QuickAccessItemProps {
  item: (typeof QuickAccessMenuItems)[0];
  index: number;
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
        <Squircle
          smoothing={'moderate'}
          className={`relative flex h-[38px] w-[38px] cursor-grab flex-col items-center justify-center rounded-md border-[0.5px] transition-all duration-300 active:cursor-grabbing ${
            isActive
              ? 'dark:border-border-default border-gray-300 bg-black text-white dark:bg-white dark:text-black'
              : 'dark:border-border-default dark:bg-elevated-surface border-gray-200 bg-gray-50 text-gray-700 opacity-50 hover:opacity-75 dark:text-current'
          }`}
        >
          <item.icon size={20} />
        </Squircle>
      </animated.div>
      {isHovered && !isDragging && (
        <div
          className={`text-regular-md absolute z-50 rounded-lg bg-black px-3 py-1.5 whitespace-nowrap text-white shadow-lg ${
            isBottomRow ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${
            isLeftEdge
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
