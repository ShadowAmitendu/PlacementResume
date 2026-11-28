import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { tokens } from '@fluentui/react-components';
import {
  AddRegular,
  SubtractRegular,
  TableCellsSplitRegular,
  DeleteRegular,
  ArrowResetRegular,
  ArrowLeftRegular,
  ArrowRightRegular,
  ArrowUpRegular,
  ArrowDownRegular,
  ReOrderDotsHorizontalRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { TableSectionData } from '../../../types/resume';
import { buildEqualColWidths, normalizeColWidths } from '../../../utils/tableWidths';
import { EditableContent } from '../EditableContent';

interface TableSectionProps {
  section: TableSectionData;
}

interface ContextMenuState {
  x: number;
  y: number;
  colIdx: number;
  rowIdx: number;
}

interface ColumnActionsPillProps {
  colIdx: number;
  colCount: number;
  isDragging?: boolean;
  dragAttributes?: Record<string, any>;
  dragListeners?: Record<string, any>;
  onAddLeft: () => void;
  onDelete: () => void;
  onAddRight: () => void;
}

const ColumnActionsPill: React.FC<ColumnActionsPillProps> = ({
  colIdx,
  colCount,
  isDragging,
  dragAttributes,
  dragListeners,
  onAddLeft,
  onDelete,
  onAddRight,
}) => {
  const alignClass =
    colIdx === 0
      ? 'left-0'
      : colIdx === colCount - 1
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className={`column-actions-pill absolute bottom-full mb-0.5 rounded-md px-1 py-0.5 flex items-center gap-0.5 z-30 no-print text-[11px] leading-none after:content-[''] after:absolute after:inset-x-0 after:top-full after:h-1.5 ${
        isDragging ? 'opacity-100 pointer-events-auto' : ''
      } ${alignClass}`}
      style={{
        backgroundColor: '#ffffff',
        color: '#242424',
        border: '1px solid #d4d4d4',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {colCount > 1 && (
        <span
          {...dragAttributes}
          {...dragListeners}
          aria-label={`Drag to move column ${colIdx + 1}`}
          aria-roledescription="sortable"
          title="Drag to reorder column"
          className="col-drag-handle px-1 py-0.5 hover:bg-neutral-100 rounded inline-flex items-center cursor-grab active:cursor-grabbing touch-none"
          style={{ color: '#525252' }}
        >
          <ReOrderDotsHorizontalRegular fontSize={12} />
        </span>
      )}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          onAddLeft();
        }}
        title="Insert column left"
        className="px-1.5 py-0.5 hover:bg-neutral-100 rounded flex items-center gap-0.5 cursor-pointer leading-none transition-colors"
        style={{ color: '#242424' }}
      >
        <AddRegular fontSize={11} />
        <span className="text-[10px] font-medium">Left</span>
      </button>
      {colCount > 1 && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete column"
          className="px-1.5 py-0.5 hover:bg-red-50 rounded flex items-center gap-0.5 cursor-pointer leading-none transition-colors"
          style={{ color: '#c42b1c' }}
        >
          <DeleteRegular fontSize={11} />
        </button>
      )}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          onAddRight();
        }}
        title="Insert column right"
        className="px-1.5 py-0.5 hover:bg-neutral-100 rounded flex items-center gap-0.5 cursor-pointer leading-none transition-colors"
        style={{ color: '#242424' }}
      >
        <span className="text-[10px] font-medium">Right</span>
        <AddRegular fontSize={11} />
      </button>
    </div>
  );
};

interface SortableHeaderCellProps {
  id: string;
  colIdx: number;
  colCount: number;
  headerText: string;
  onChangeHeader: (val: string) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onAddLeft: () => void;
  onDelete: () => void;
  onAddRight: () => void;
  onResizerPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onResetWidths: () => void;
}

const SortableHeaderCell: React.FC<SortableHeaderCellProps> = ({
  id,
  colIdx,
  colCount,
  headerText,
  onChangeHeader,
  onContextMenu,
  onAddLeft,
  onDelete,
  onAddRight,
  onResizerPointerDown,
  onResetWidths,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    zIndex: isDragging ? 25 : undefined,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="relative"
      onContextMenu={onContextMenu}
    >
      <ColumnActionsPill
        colIdx={colIdx}
        colCount={colCount}
        isDragging={isDragging}
        dragAttributes={attributes}
        dragListeners={listeners}
        onAddLeft={onAddLeft}
        onDelete={onDelete}
        onAddRight={onAddRight}
      />

      <EditableContent
        tagName="div"
        html={headerText}
        onChange={onChangeHeader}
        placeholder="[Header]"
        className="block w-full"
      />
      {colIdx < colCount - 1 && (
        <div
          onPointerDown={onResizerPointerDown}
          onDoubleClick={onResetWidths}
          className="resizer no-print"
          title="Drag to resize column (Double-click to balance)"
        />
      )}
    </th>
  );
};

interface SortableFirstRowCellProps {
  id: string;
  enableSortable: boolean;
  colIdx: number;
  colCount: number;
  isProfile: boolean;
  cellText: string;
  rowLength: number;
  onChangeCell: (val: string) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onAddLeft: () => void;
  onDeleteCol: () => void;
  onAddRight: () => void;
  onAddRowBelow: () => void;
  onDeleteRow: () => void;
  canDeleteRow: boolean;
  onResizerPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onResetWidths: () => void;
}

const SortableFirstRowCell: React.FC<SortableFirstRowCellProps> = ({
  id,
  enableSortable,
  colIdx,
  colCount,
  isProfile,
  cellText,
  rowLength,
  onChangeCell,
  onContextMenu,
  onAddLeft,
  onDeleteCol,
  onAddRight,
  onAddRowBelow,
  onDeleteRow,
  canDeleteRow,
  onResizerPointerDown,
  onResetWidths,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !enableSortable,
  });

  const style: React.CSSProperties = enableSortable
    ? {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
        zIndex: isDragging ? 25 : undefined,
      }
    : {};

  return (
    <td
      ref={enableSortable ? setNodeRef : undefined}
      style={style}
      className={`${isProfile || colIdx === 0 ? 'text-left' : ''} relative`}
      onContextMenu={onContextMenu}
    >
      {enableSortable && (
        <ColumnActionsPill
          colIdx={colIdx}
          colCount={colCount}
          isDragging={isDragging}
          dragAttributes={attributes}
          dragListeners={listeners}
          onAddLeft={onAddLeft}
          onDelete={onDeleteCol}
          onAddRight={onAddRight}
        />
      )}

      <EditableContent
        tagName="div"
        html={cellText}
        onChange={onChangeCell}
        placeholder="[Data]"
        className="block w-full"
      />

      {colIdx === rowLength - 1 && (
        <div
          className="row-actions-pill absolute -right-7 sm:-right-9 top-1/2 -translate-y-1/2 rounded-md px-1 py-0.5 flex items-center gap-0.5 z-30 no-print text-[11px]"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d4d4d4',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onAddRowBelow();
            }}
            title="Insert row below"
            className="p-1 hover:bg-neutral-100 rounded flex items-center cursor-pointer leading-none transition-colors"
            style={{ color: '#242424' }}
          >
            <AddRegular fontSize={12} />
          </button>
          {canDeleteRow && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRow();
              }}
              title="Delete row"
              className="p-1 hover:bg-red-50 rounded flex items-center cursor-pointer leading-none transition-colors"
              style={{ color: '#c42b1c' }}
            >
              <DeleteRegular fontSize={12} />
            </button>
          )}
        </div>
      )}

      {enableSortable && colIdx < colCount - 1 && (
        <div
          onPointerDown={onResizerPointerDown}
          onDoubleClick={onResetWidths}
          className="resizer no-print"
          title="Drag to resize column (Double-click to balance)"
        />
      )}
    </td>
  );
};

export const TableSection: React.FC<TableSectionProps> = ({ section }) => {
  const {
    addTableRow,
    deleteTableRow,
    addTableColumn,
    deleteTableColumn,
    reorderTableColumn,
    toggleTableBorders,
    updateTableCell,
    updateSection,
  } = useResume();

  const tableRef = useRef<HTMLTableElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const isProfile = section.variant === 'profile';

  const colSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!contextMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  const tableClasses = [
    isProfile ? 'profile-table' : 'striped',
    section.showColBorders ? 'show-col-borders' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const colCount = section.headers?.length || (section.rows[0] ? section.rows[0].length : 0);
  const columnIds = useMemo(
    () => Array.from({ length: colCount }, (_, i) => `${section.id}-col-${i}`),
    [section.id, colCount]
  );

  const handleColDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = columnIds.indexOf(String(active.id));
    const newIndex = columnIds.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderTableColumn(section.id, oldIndex, newIndex);
    }
  };

  const getActiveWidths = (): number[] => {
    if (colCount <= 0) return [];
    if (section.colWidths && section.colWidths.length === colCount) {
      return normalizeColWidths(section.colWidths);
    }
    if (isProfile && colCount === 2) {
      return [35, 65];
    }
    return buildEqualColWidths(colCount);
  };

  const activeWidths = getActiveWidths();

  const handleResetWidths = () => {
    if (colCount <= 0) return;
    const balanced =
      isProfile && colCount === 2 ? [35, 65] : buildEqualColWidths(colCount);
    updateSection(section.id, { colWidths: balanced });
  };

  const handleResizerPointerDown = (colIndex: number, e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tableRef.current) return;
    const table = tableRef.current;
    const tableWidth = table.getBoundingClientRect().width;
    if (tableWidth <= 0) return;

    const startX = e.clientX;
    const pointerId = e.pointerId;
    const currentWidths = [...activeWidths];
    const startWidthA = currentWidths[colIndex];
    const startWidthB = currentWidths[colIndex + 1];
    const pairTotal = Math.round((startWidthA + startWidthB) * 10) / 10;

    const resizerEl = e.currentTarget as HTMLElement;
    try {
      resizerEl.setPointerCapture(pointerId);
    } catch {
      // Ignore if synthetic event lacks active pointerId
    }
    resizerEl.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    let latestWidths = currentWidths;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const deltaPercent = ((moveEvent.clientX - startX) / tableWidth) * 100;

      const minPercent = Math.min(6, pairTotal / 2);
      const maxPercentA = Math.max(minPercent, pairTotal - minPercent);
      const rawA = Math.min(maxPercentA, Math.max(minPercent, startWidthA + deltaPercent));
      const newWidthA = Math.round(rawA * 10) / 10;
      const newWidthB = Math.round((pairTotal - newWidthA) * 10) / 10;

      const next = [...currentWidths];
      next[colIndex] = newWidthA;
      next[colIndex + 1] = newWidthB;
      latestWidths = next;

      const colElements = table.querySelectorAll('colgroup col');
      if (colElements.length === next.length) {
        (colElements[colIndex] as HTMLElement).style.width = `${newWidthA}%`;
        (colElements[colIndex + 1] as HTMLElement).style.width = `${newWidthB}%`;
      }
    };

    const handlePointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      try {
        if (resizerEl.hasPointerCapture(pointerId)) {
          resizerEl.releasePointerCapture(pointerId);
        }
      } catch {
        // Ignore
      }
      resizerEl.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerEnd);
      document.removeEventListener('pointercancel', handlePointerEnd);
      updateSection(section.id, { colWidths: latestWidths });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerEnd);
    document.addEventListener('pointercancel', handlePointerEnd);
  };

  return (
    <div className="table-wrap relative pt-5 print:pt-0">
      <DndContext
        sensors={colSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleColDragEnd}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <table ref={tableRef} className={tableClasses}>
            {colCount > 0 && (
              <colgroup>
                {activeWidths.map((widthPct, idx) => (
                  <col key={idx} style={{ width: `${widthPct}%` }} />
                ))}
              </colgroup>
            )}

            {section.headers && section.headers.length > 0 && (
              <thead>
                <tr>
                  {section.headers.map((headerText, colIdx) => (
                    <SortableHeaderCell
                      key={columnIds[colIdx]}
                      id={columnIds[colIdx]}
                      colIdx={colIdx}
                      colCount={colCount}
                      headerText={headerText}
                      onChangeHeader={(val) => updateTableCell(section.id, 0, colIdx, val, true)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          colIdx,
                          rowIdx: -1,
                        });
                      }}
                      onAddLeft={() => addTableColumn(section.id, colIdx)}
                      onDelete={() => deleteTableColumn(section.id, colIdx)}
                      onAddRight={() => addTableColumn(section.id, colIdx + 1)}
                      onResizerPointerDown={(e) => handleResizerPointerDown(colIdx, e)}
                      onResetWidths={handleResetWidths}
                    />
                  ))}
                </tr>
              </thead>
            )}

            <tbody>
              {section.rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cellText, colIdx) => {
                    const headerlessFirstRow = !section.headers && rowIdx === 0;
                    if (headerlessFirstRow) {
                      return (
                        <SortableFirstRowCell
                          key={columnIds[colIdx] || colIdx}
                          id={columnIds[colIdx] || `${section.id}-col-${colIdx}`}
                          enableSortable
                          colIdx={colIdx}
                          colCount={colCount}
                          isProfile={isProfile}
                          cellText={cellText}
                          rowLength={row.length}
                          onChangeCell={(val) =>
                            updateTableCell(section.id, rowIdx, colIdx, val, false)
                          }
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              colIdx,
                              rowIdx,
                            });
                          }}
                          onAddLeft={() => addTableColumn(section.id, colIdx)}
                          onDeleteCol={() => deleteTableColumn(section.id, colIdx)}
                          onAddRight={() => addTableColumn(section.id, colIdx + 1)}
                          onAddRowBelow={() => addTableRow(section.id, rowIdx + 1)}
                          onDeleteRow={() => deleteTableRow(section.id, rowIdx)}
                          canDeleteRow={section.rows.length > 1}
                          onResizerPointerDown={(e) => handleResizerPointerDown(colIdx, e)}
                          onResetWidths={handleResetWidths}
                        />
                      );
                    }

                    return (
                      <td
                        key={colIdx}
                        className={`${isProfile || colIdx === 0 ? 'text-left' : ''} relative`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            colIdx,
                            rowIdx,
                          });
                        }}
                      >
                        <EditableContent
                          tagName="div"
                          html={cellText}
                          onChange={(val) => updateTableCell(section.id, rowIdx, colIdx, val, false)}
                          placeholder="[Data]"
                          className="block w-full"
                        />

                        {colIdx === row.length - 1 && (
                          <div
                            className="row-actions-pill absolute -right-7 sm:-right-9 top-1/2 -translate-y-1/2 rounded-md px-1 py-0.5 flex items-center gap-0.5 z-30 no-print text-[11px]"
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #d4d4d4',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                addTableRow(section.id, rowIdx + 1);
                              }}
                              title="Insert row below"
                              className="p-1 hover:bg-neutral-100 rounded flex items-center cursor-pointer leading-none transition-colors"
                              style={{ color: '#242424' }}
                            >
                              <AddRegular fontSize={12} />
                            </button>
                            {section.rows.length > 1 && (
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTableRow(section.id, rowIdx);
                                }}
                                title="Delete row"
                                className="p-1 hover:bg-red-50 rounded flex items-center cursor-pointer leading-none transition-colors"
                                style={{ color: '#c42b1c' }}
                              >
                                <DeleteRegular fontSize={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      {/* Monochrome Subtle Table Controls */}
      <div className="table-controls no-print">
        <button
          type="button"
          onClick={() => addTableRow(section.id)}
          title="Add row at end"
        >
          <AddRegular fontSize={12} />
          <span>Row</span>
        </button>
        <button
          type="button"
          onClick={() => deleteTableRow(section.id)}
          className="del-btn"
          title="Delete last row"
        >
          <SubtractRegular fontSize={12} />
          <span>Row</span>
        </button>
        <button
          type="button"
          onClick={() => addTableColumn(section.id)}
          title="Add column at end"
        >
          <AddRegular fontSize={12} />
          <span>Column</span>
        </button>
        <button
          type="button"
          onClick={() => deleteTableColumn(section.id)}
          className="del-btn"
          title="Delete last column"
        >
          <SubtractRegular fontSize={12} />
          <span>Column</span>
        </button>
        <button
          type="button"
          onClick={() => toggleTableBorders(section.id)}
          className={section.showColBorders ? 'is-active' : ''}
          title="Toggle vertical column borders"
        >
          <TableCellsSplitRegular fontSize={12} />
          <span>Borders</span>
        </button>
        <button
          type="button"
          onClick={handleResetWidths}
          title="Equalize column widths"
        >
          <ArrowResetRegular fontSize={12} />
          <span>Balance</span>
        </button>
      </div>

      {/* Fluent Right-Click Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 310),
            left: Math.min(contextMenu.x, window.innerWidth - 210),
            backgroundColor: tokens.colorNeutralBackground1,
            color: tokens.colorNeutralForeground1,
            border: `1px solid ${tokens.colorNeutralStroke1}`,
            boxShadow: tokens.shadow16,
          }}
          className="fixed z-50 min-w-47.5 rounded-md py-1 text-xs select-none no-print"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: tokens.colorNeutralForeground3 }}
          >
            Column {contextMenu.colIdx + 1}
          </div>
          {contextMenu.colIdx > 0 && (
            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
              onClick={() => {
                reorderTableColumn(section.id, contextMenu.colIdx, contextMenu.colIdx - 1);
                setContextMenu(null);
              }}
            >
              <ArrowLeftRegular fontSize={14} />
              <span>Move column left</span>
            </button>
          )}
          {contextMenu.colIdx < colCount - 1 && (
            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
              onClick={() => {
                reorderTableColumn(section.id, contextMenu.colIdx, contextMenu.colIdx + 1);
                setContextMenu(null);
              }}
            >
              <ArrowRightRegular fontSize={14} />
              <span>Move column right</span>
            </button>
          )}
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
            onClick={() => {
              addTableColumn(section.id, contextMenu.colIdx);
              setContextMenu(null);
            }}
          >
            <ArrowLeftRegular fontSize={14} />
            <span>Insert column left</span>
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
            onClick={() => {
              addTableColumn(section.id, contextMenu.colIdx + 1);
              setContextMenu(null);
            }}
          >
            <ArrowRightRegular fontSize={14} />
            <span>Insert column right</span>
          </button>
          {colCount > 1 && (
            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 cursor-pointer"
              style={{ color: tokens.colorPaletteRedForeground1 }}
              onClick={() => {
                deleteTableColumn(section.id, contextMenu.colIdx);
                setContextMenu(null);
              }}
            >
              <DeleteRegular fontSize={14} />
              <span>Delete column</span>
            </button>
          )}

          {contextMenu.rowIdx >= 0 && (
            <>
              <div
                className="h-px my-1"
                style={{ backgroundColor: tokens.colorNeutralStroke2 }}
              />
              <div
                className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: tokens.colorNeutralForeground3 }}
              >
                Row {contextMenu.rowIdx + 1}
              </div>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  addTableRow(section.id, contextMenu.rowIdx);
                  setContextMenu(null);
                }}
              >
                <ArrowUpRegular fontSize={14} />
                <span>Insert row above</span>
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  addTableRow(section.id, contextMenu.rowIdx + 1);
                  setContextMenu(null);
                }}
              >
                <ArrowDownRegular fontSize={14} />
                <span>Insert row below</span>
              </button>
              {section.rows.length > 1 && (
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 cursor-pointer"
                  style={{ color: tokens.colorPaletteRedForeground1 }}
                  onClick={() => {
                    deleteTableRow(section.id, contextMenu.rowIdx);
                    setContextMenu(null);
                  }}
                >
                  <DeleteRegular fontSize={14} />
                  <span>Delete row</span>
                </button>
              )}
            </>
          )}

          <div
            className="h-px my-1"
            style={{ backgroundColor: tokens.colorNeutralStroke2 }}
          />
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
            onClick={() => {
              handleResetWidths();
              setContextMenu(null);
            }}
          >
            <ArrowResetRegular fontSize={14} />
            <span>Balance column widths</span>
          </button>
        </div>
      )}
    </div>
  );
};
