import { Squircle } from '@/app/components/ui/squircle';
import React, { useState, useEffect } from 'react';
import { QuickToolsItems, QuickToolItem } from './QuickToolsData';
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Search } from 'lucide-react';
import { useMapContext } from '../../context/MapContext';

const QuickToolsBar = () => {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [items, setItems] = useState(QuickToolsItems);
  const [searchFocused, setSearchFocused] = useState(false);
  const { zoomIn, zoomOut, resetZoom } = useMapContext();

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
          placeholder="search anything ..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="dark:border-border-default dark:bg-elevated-surface h-[35px] w-full rounded-full border border-gray-200 bg-white pr-4 pl-10 text-sm transition-all outline-none placeholder:text-gray-400 focus:border-gray-400 dark:placeholder:text-gray-500 dark:focus:border-gray-600"
        />
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
        <Squircle
          smoothing={'moderate'}
          className={`flex h-[35px] w-[35px] cursor-grab items-center justify-center transition-all duration-300 active:cursor-grabbing ${
            isActive
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'dark:bg-elevated-surface bg-gray-50 text-gray-700 opacity-50 hover:opacity-75 dark:text-current'
          }`}
        >
          <item.icon size={18} />
        </Squircle>
      </animated.div>
      {isHovered && !isDragging && (
        <div className="text-regular-md absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-lg bg-black px-3 py-1.5 whitespace-nowrap text-white shadow-lg">
          {item.name}
        </div>
      )}
    </div>
  );
};

export default QuickToolsBar;
