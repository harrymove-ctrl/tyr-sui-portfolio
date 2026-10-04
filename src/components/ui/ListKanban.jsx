/**
 * ListKanban
 *
 * A tactile Kanban board where cards can be reordered ONLY within their own column.
 * Columns represent factual categories; cross-column moves are impossible by construction.
 *
 * Props:
 * - columns: Array<{ id: string, title: string, description?: string, accent?: 'agent' | 'sui' | 'walrus', items: Array<{ id: string, [key: string]: any }> }>
 * - onReorder: (columnId: string, nextItems: Array<{ id: string, [key: string]: any }>) => void
 * - renderCard: (item: object, state: { isDragging: boolean, column: object, handle: React.ReactNode }) => React.ReactNode
 *   The card places `handle` (the drag/keyboard reorder control) wherever it fits its layout.
 * - itemLabel: (item: object) => string
 * - className?: string
 */

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { Reorder, useDragControls, useReducedMotion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

/** Move an array item from one index to another */
function arrayMove(array, fromIndex, toIndex) {
  const next = [...array];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

/** Column indicator dot; `accent` is a category id (agent | sui | walrus). */
const ACCENT_DOT = { agent: 'bg-cat-agent', sui: 'bg-cat-sui', walrus: 'bg-cat-walrus' };
const getAccentClass = (accent) => ACCENT_DOT[accent] ?? 'bg-primary';

/** Individual draggable card component with its own drag controls */
function KanbanCardItem({
  item,
  index,
  items,
  column,
  renderCard,
  getItemLabel,
  instructionId,
  onMove,
  onAnnounce,
  pendingFocusId,
  onFocusConsumed,
  shouldReduceMotion,
  constraintsRef,
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef(null);

  const label = getItemLabel(item);

  // Restore keyboard focus to handle after reorder
  useEffect(() => {
    if (pendingFocusId === item.id && handleRef.current) {
      handleRef.current.focus();
      onFocusConsumed();
    }
  }, [pendingFocusId, item.id, onFocusConsumed]);

  const handleKeyDown = (e) => {
    const { key } = e;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End', ' ', 'Enter'].includes(key)) {
      return;
    }

    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const total = items.length;
    const columnTitle = column.title || 'column';

    if (key === 'ArrowUp') {
      if (index > 0) {
        const nextIndex = index - 1;
        const nextItems = arrayMove(items, index, nextIndex);
        onMove(
          column.id,
          nextItems,
          item.id,
          `${label} moved to position ${nextIndex + 1} of ${total} in ${columnTitle}.`
        );
      } else {
        onAnnounce(`${label} is already first in ${columnTitle}.`);
      }
    } else if (key === 'ArrowDown') {
      if (index < total - 1) {
        const nextIndex = index + 1;
        const nextItems = arrayMove(items, index, nextIndex);
        onMove(
          column.id,
          nextItems,
          item.id,
          `${label} moved to position ${nextIndex + 1} of ${total} in ${columnTitle}.`
        );
      } else {
        onAnnounce(`${label} is already last in ${columnTitle}.`);
      }
    } else if (key === 'Home') {
      if (index > 0) {
        const nextIndex = 0;
        const nextItems = arrayMove(items, index, nextIndex);
        onMove(
          column.id,
          nextItems,
          item.id,
          `${label} moved to position 1 of ${total} in ${columnTitle}.`
        );
      } else {
        onAnnounce(`${label} is already first in ${columnTitle}.`);
      }
    } else if (key === 'End') {
      if (index < total - 1) {
        const nextIndex = total - 1;
        const nextItems = arrayMove(items, index, nextIndex);
        onMove(
          column.id,
          nextItems,
          item.id,
          `${label} moved to position ${total} of ${total} in ${columnTitle}.`
        );
      } else {
        onAnnounce(`${label} is already last in ${columnTitle}.`);
      }
    }
  };

  const springTransition = {
    type: 'spring',
    stiffness: 420,
    damping: 34,
  };

  return (
    <Reorder.Item
      as="li"
      value={item}
      id={`kanban-item-${item.id}`}
      dragListener={false}
      dragControls={controls}
      dragConstraints={constraintsRef}
      dragElastic={0.08}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      layout={true}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              ...springTransition,
              layout: springTransition,
              default: springTransition,
              opacity: { duration: 0.25, delay: Math.min(index * 0.05, 0.3) },
            }
      }
      whileHover={
        shouldReduceMotion || isDragging
          ? undefined
          : { y: -1, transition: { duration: 0.15 } }
      }
      whileDrag={
        shouldReduceMotion
          ? { zIndex: 20 }
          : {
              scale: 1.035,
              rotate: -1,
              boxShadow: 'var(--shadow-lift)',
              zIndex: 20,
            }
      }
      className="relative list-none rounded-card border border-line bg-surface shadow-[0_1px_2px_rgb(var(--shadow-rgb)/0.05)] transition-[box-shadow,border-color] hover:border-line-strong/40"
    >
      <div className="p-[18px] sm:p-5">
        {renderCard
          ? renderCard(item, {
              isDragging,
              column,
              handle: (
                <button
                  ref={handleRef}
                  type="button"
                  onPointerDown={(e) => {
                    if (e.button === 0) {
                      controls.start(e);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  aria-label={`Reorder ${label}`}
                  aria-describedby={instructionId}
                  className="-mr-2.5 -my-1 inline-flex size-11 shrink-0 cursor-grab select-none items-center justify-center rounded-lg text-muted/70 transition-colors hover:bg-surface-2 hover:text-fg active:cursor-grabbing"
                  style={{ touchAction: 'none' }}
                >
                  <GripVertical className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
              ),
            })
          : null}
      </div>
    </Reorder.Item>
  );
}

/** One category column; its list element bounds card drags so cards stay inside the column. */
function KanbanColumn({
  column,
  onReorder,
  renderCard,
  getItemLabel,
  instructionId,
  onMove,
  onAnnounce,
  pendingFocusId,
  onFocusConsumed,
  shouldReduceMotion,
}) {
  const listRef = useRef(null);
  const items = column.items || [];
  const headingId = `kanban-col-heading-${column.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="theme-fade flex flex-col rounded-[20px] bg-column p-3"
    >
      <header className="px-1 py-1 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`size-2.5 rounded-full shrink-0 ${getAccentClass(column.accent)}`}
              aria-hidden="true"
            />
            <h3 id={headingId} className="font-display font-semibold text-fg truncate text-base">
              {column.title}
            </h3>
          </div>
          <span
            aria-label={`${items.length} items`}
            className="inline-flex shrink-0 items-center rounded-full bg-surface px-2 py-0.5 font-mono text-xs text-muted"
          >
            {items.length}
          </span>
        </div>
        {column.description && <p className="mt-1 text-sm text-muted pl-4.5">{column.description}</p>}
      </header>

      <Reorder.Group
        ref={listRef}
        as="ol"
        axis="y"
        values={items}
        onReorder={(next) => onReorder?.(column.id, next)}
        className="flex flex-col gap-3 list-none p-0 m-0 flex-1"
      >
        {items.map((item, index) => (
          <KanbanCardItem
            key={item.id}
            item={item}
            index={index}
            items={items}
            column={column}
            renderCard={renderCard}
            getItemLabel={getItemLabel}
            instructionId={instructionId}
            onMove={onMove}
            onAnnounce={onAnnounce}
            pendingFocusId={pendingFocusId}
            onFocusConsumed={onFocusConsumed}
            shouldReduceMotion={shouldReduceMotion}
            constraintsRef={listRef}
          />
        ))}
      </Reorder.Group>
    </section>
  );
}

export function ListKanban({
  columns = [],
  onReorder,
  renderCard,
  itemLabel,
  className,
}) {
  const instructionId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [announcement, setAnnouncement] = useState('');
  const [pendingFocusId, setPendingFocusId] = useState(null);

  const getItemLabel = useCallback(
    (item) => {
      if (typeof itemLabel === 'function') {
        return itemLabel(item) || 'Item';
      }
      return item?.title || item?.name || item?.label || item?.id || 'Item';
    },
    [itemLabel]
  );

  const announce = useCallback((message) => {
    // Append zero-width space if message is identical to force screen reader announcement
    setAnnouncement((prev) => (prev === message ? `${message}\u200B` : message));
  }, []);

  const handleMove = useCallback(
    (columnId, nextItems, movedItemId, announcementText) => {
      setPendingFocusId(movedItemId);
      announce(announcementText);
      onReorder?.(columnId, nextItems);
    },
    [announce, onReorder]
  );

  const handleFocusConsumed = useCallback(() => {
    setPendingFocusId(null);
  }, []);

  return (
    <div className={className || 'grid gap-4 lg:grid-cols-3'}>
      {/* Visually hidden instructions for screen readers and keyboard users */}
      <span id={instructionId} className="sr-only">
        Drag, or focus this handle and press the arrow keys to move the card within its column.
      </span>

      {/* Live announcement region for reordering events */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          onReorder={onReorder}
          renderCard={renderCard}
          getItemLabel={getItemLabel}
          instructionId={instructionId}
          onMove={handleMove}
          onAnnounce={announce}
          pendingFocusId={pendingFocusId}
          onFocusConsumed={handleFocusConsumed}
          shouldReduceMotion={shouldReduceMotion}
        />
      ))}
    </div>
  );
}

export default ListKanban;
