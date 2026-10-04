/**
 * TreeView
 *
 * An accessible, animated tree for a curated resource explorer adhering to
 * the WAI-ARIA APG Treeview design pattern.
 *
 * Props:
 * - data: Array<{
 *     id: string,
 *     label: string,
 *     icon?: ReactComponent | ReactNode,
 *     hint?: string,
 *     children?: Array<node>
 *   }>
 * - selectedId: string | null (controlled selection ID)
 * - onSelect: (node: object) => void (invoked for any node, branch or leaf)
 * - defaultExpanded?: string[] (array of IDs to expand initially; defaults to all top-level branches)
 * - label?: string (accessible name for the tree, applied as aria-label)
 * - className?: string (optional CSS classes applied to root <ul>)
 */

import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  useId,
} from 'react';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/** Easing curve matching design system token --ease-out-soft */
const EASE_OUT_SOFT = [0.22, 1, 0.36, 1];

/** Traverse tree data and build fast node and parent lookup maps */
function buildTreeIndex(data) {
  const nodeMap = new Map();
  const parentMap = new Map();

  function traverse(nodes, parent = null) {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      nodeMap.set(node.id, node);
      if (parent) {
        parentMap.set(node.id, parent);
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        traverse(node.children, node);
      }
    }
  }

  traverse(data);
  return { nodeMap, parentMap };
}

/** Flatten all currently visible nodes in depth-first order */
function getVisibleNodes(nodes, expandedSet) {
  const visible = [];

  function traverse(list) {
    if (!Array.isArray(list)) return;
    for (const node of list) {
      visible.push(node);
      const isBranch = Array.isArray(node.children) && node.children.length > 0;
      if (isBranch && expandedSet.has(node.id)) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return visible;
}

/** Compute the set of all ancestor IDs for a given node ID */
function getAncestorIds(parentMap, targetId) {
  const ancestors = new Set();
  if (!targetId) return ancestors;
  let curr = parentMap.get(targetId);
  while (curr) {
    ancestors.add(curr.id);
    curr = parentMap.get(curr.id);
  }
  return ancestors;
}

/** Individual Tree Node item component */
function TreeNodeItem({
  node,
  level,
  setsize,
  posinset,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  activeAncestorIds,
  activeTabId,
  onFocusNode,
  onKeyDown,
  nodeRefs,
  shouldReduceMotion,
}) {
  const isBranch = Array.isArray(node.children) && node.children.length > 0;
  const isExpanded = isBranch && expandedIds.has(node.id);
  const isSelected = Boolean(selectedId != null && selectedId === node.id);
  const isTabTarget = activeTabId === node.id;
  const isActiveBranch = isBranch && activeAncestorIds.has(node.id);

  const handleClick = (e) => {
    e.stopPropagation();
    onFocusNode(node.id);
    onSelect?.(node);
    if (isBranch) {
      onToggleExpand(node.id);
    }
  };

  const handleKeyDownItem = (e) => {
    onKeyDown(e, node);
  };

  return (
    <li role="none" className="list-none m-0 p-0 relative">
      <div
        ref={(el) => {
          if (el) {
            nodeRefs.current.set(node.id, el);
          } else {
            nodeRefs.current.delete(node.id);
          }
        }}
        role="treeitem"
        id={`treeitem-${node.id}`}
        tabIndex={isTabTarget ? 0 : -1}
        aria-level={level}
        aria-setsize={setsize}
        aria-posinset={posinset}
        aria-expanded={isBranch ? isExpanded : undefined}
        aria-selected={isSelected}
        onClick={handleClick}
        onKeyDown={handleKeyDownItem}
        className={`group relative flex h-11 min-h-[44px] w-full items-center gap-2 rounded-lg px-2 text-left select-none cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px] ${
          isSelected
            ? 'bg-soft text-fg font-medium'
            : 'text-fg hover:bg-surface-2 font-normal'
        }`}
      >
        {/* 3px primary indicator bar for selected item */}
        {isSelected && (
          <motion.span
            layoutId="tree-selection-indicator"
            className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary"
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 380, damping: 30 }
            }
            aria-hidden="true"
          />
        )}

        {/* Branch chevron or leaf spacer */}
        {isBranch ? (
          <span
            className="flex size-5 shrink-0 items-center justify-center text-muted"
            aria-hidden="true"
          >
            <ChevronRight
              className={`size-3.5 transition-transform ${
                shouldReduceMotion ? 'duration-0' : 'duration-200'
              } ${isExpanded ? 'rotate-90' : ''}`}
            />
          </span>
        ) : (
          <span className="size-5 shrink-0" aria-hidden="true" />
        )}

        {/* Optional Node Icon */}
        {node.icon && (
          <span
            className="flex size-4 shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            {React.isValidElement(node.icon) ? (
              node.icon
            ) : (
              <node.icon
                className={`size-4 shrink-0 transition-colors duration-150 ${
                  isSelected ? 'text-primary' : 'text-muted'
                }`}
              />
            )}
          </span>
        )}

        {/* Node Label */}
        <span className="truncate text-sm">{node.label}</span>

        {/* Optional Hint */}
        {node.hint && (
          <span className="ml-auto pl-2 shrink-0 truncate font-mono text-xs text-muted">
            {node.hint}
          </span>
        )}
      </div>

      {/* Nested Branch Group */}
      {isBranch && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.ul
              role="group"
              className="relative pl-6 list-none m-0 p-0"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { height: 0, opacity: 0 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { height: 'auto', opacity: 1 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { height: 0, opacity: 0 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.24, ease: EASE_OUT_SOFT }
              }
              style={{ overflow: 'hidden' }}
            >
              {/* Branch vertical guide line aligned under parent chevron (left: 18px) */}
              <span
                className={`absolute left-[18px] top-0 bottom-2 w-px pointer-events-none transition-colors duration-200 ease-out ${
                  isActiveBranch ? 'bg-primary' : 'bg-line'
                }`}
                aria-hidden="true"
              />

              {node.children.map((childNode, index) => (
                <TreeNodeItem
                  key={childNode.id}
                  node={childNode}
                  level={level + 1}
                  setsize={node.children.length}
                  posinset={index + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                  activeAncestorIds={activeAncestorIds}
                  activeTabId={activeTabId}
                  onFocusNode={onFocusNode}
                  onKeyDown={onKeyDown}
                  nodeRefs={nodeRefs}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}

/**
 * TreeView Component
 */
export function TreeView({
  data = [],
  selectedId,
  onSelect,
  defaultExpanded,
  label,
  className = '',
}) {
  const treeId = useId();
  const shouldReduceMotion = useReducedMotion();
  const nodeRefs = useRef(new Map());
  const [focusedId, setFocusedId] = useState(null);

  // Build index of all nodes and parents
  const { nodeMap, parentMap } = useMemo(() => buildTreeIndex(data), [data]);

  // Compute initial expanded branches
  const [expandedIds, setExpandedIds] = useState(() => {
    if (Array.isArray(defaultExpanded)) {
      return new Set(defaultExpanded);
    }
    // Default: all top-level branches expanded
    const topBranches = (data || [])
      .filter((n) => Array.isArray(n.children) && n.children.length > 0)
      .map((n) => n.id);
    const initialSet = new Set(topBranches);

    // If selectedId provided, also ensure its ancestors are visible
    if (selectedId) {
      let curr = parentMap.get(selectedId);
      while (curr) {
        initialSet.add(curr.id);
        curr = parentMap.get(curr.id);
      }
    }
    return initialSet;
  });

  // Keep ancestors of selectedId expanded when selection changes externally
  useEffect(() => {
    if (!selectedId) return;
    let curr = parentMap.get(selectedId);
    let changed = false;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      while (curr) {
        if (!next.has(curr.id)) {
          next.add(curr.id);
          changed = true;
        }
        curr = parentMap.get(curr.id);
      }
      return changed ? next : prev;
    });
  }, [selectedId, parentMap]);

  // Compute active branch ancestors (ancestors of selectedId)
  const activeAncestorIds = useMemo(
    () => getAncestorIds(parentMap, selectedId),
    [parentMap, selectedId]
  );

  // Compute all currently visible nodes in tree order
  const visibleNodes = useMemo(
    () => getVisibleNodes(data, expandedIds),
    [data, expandedIds]
  );

  // Determine roving tabindex target: focused node if visible, else selected node if visible, else first visible
  const activeTabId = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    if (focusedId && visibleIds.has(focusedId)) {
      return focusedId;
    }
    if (selectedId && visibleIds.has(selectedId)) {
      return selectedId;
    }
    return visibleNodes[0]?.id ?? null;
  }, [visibleNodes, focusedId, selectedId]);

  // Programmatically focus a tree item
  const focusNode = useCallback((id) => {
    setFocusedId(id);
    const el = nodeRefs.current.get(id);
    if (el) {
      el.focus();
    }
  }, []);

  // Toggle expand / collapse for a branch node
  const handleToggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Keyboard navigation complying with WAI-ARIA APG Treeview pattern
  const handleKeyDown = useCallback(
    (e, currentNode) => {
      const { key } = e;
      const visibleIds = visibleNodes.map((n) => n.id);
      const currentIndex = visibleIds.indexOf(currentNode.id);
      const isBranch =
        Array.isArray(currentNode.children) && currentNode.children.length > 0;
      const isExpanded = isBranch && expandedIds.has(currentNode.id);

      switch (key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIndex >= 0 && currentIndex < visibleNodes.length - 1) {
            focusNode(visibleNodes[currentIndex + 1].id);
          }
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex > 0) {
            focusNode(visibleNodes[currentIndex - 1].id);
          }
          break;
        }

        case 'ArrowRight': {
          e.preventDefault();
          if (isBranch) {
            if (!isExpanded) {
              // Expands a closed branch; focus remains on current node
              setExpandedIds((prev) => new Set([...prev, currentNode.id]));
            } else if (currentNode.children.length > 0) {
              // Moves to first child of an open branch
              focusNode(currentNode.children[0].id);
            }
          }
          break;
        }

        case 'ArrowLeft': {
          e.preventDefault();
          if (isBranch && isExpanded) {
            // Collapses an open branch; focus remains on current node
            setExpandedIds((prev) => {
              const next = new Set(prev);
              next.delete(currentNode.id);
              return next;
            });
          } else {
            // Moves to parent node if closed or leaf
            const parent = parentMap.get(currentNode.id);
            if (parent) {
              focusNode(parent.id);
            }
          }
          break;
        }

        case 'Home': {
          e.preventDefault();
          if (visibleNodes.length > 0) {
            focusNode(visibleNodes[0].id);
          }
          break;
        }

        case 'End': {
          e.preventDefault();
          if (visibleNodes.length > 0) {
            focusNode(visibleNodes[visibleNodes.length - 1].id);
          }
          break;
        }

        case 'Enter':
        case ' ': {
          e.preventDefault();
          onSelect?.(currentNode);
          if (isBranch) {
            handleToggleExpand(currentNode.id);
          }
          break;
        }

        default: {
          // Printable character type-ahead navigation
          if (
            key.length === 1 &&
            !e.altKey &&
            !e.ctrlKey &&
            !e.metaKey &&
            key !== ' '
          ) {
            const char = key.toLowerCase();
            const count = visibleNodes.length;
            if (count > 0) {
              // Search from currentIndex + 1, wrapping around to currentIndex
              for (let i = 1; i <= count; i++) {
                const targetNode = visibleNodes[(currentIndex + i) % count];
                if (
                  targetNode.label &&
                  targetNode.label.trim().toLowerCase().startsWith(char)
                ) {
                  e.preventDefault();
                  focusNode(targetNode.id);
                  break;
                }
              }
            }
          }
          break;
        }
      }
    },
    [
      visibleNodes,
      expandedIds,
      parentMap,
      focusNode,
      handleToggleExpand,
      onSelect,
    ]
  );

  return (
    <LayoutGroup id={treeId}>
      <ul
        role="tree"
        aria-label={label}
        className={`flex flex-col list-none m-0 p-0 ${className}`}
      >
        {data.map((node, index) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            level={1}
            setsize={data.length}
            posinset={index + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            activeAncestorIds={activeAncestorIds}
            activeTabId={activeTabId}
            onFocusNode={focusNode}
            onKeyDown={handleKeyDown}
            nodeRefs={nodeRefs}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </ul>
    </LayoutGroup>
  );
}

export default TreeView;
