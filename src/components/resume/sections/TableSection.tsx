import React, { useRef, useState, useEffect } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { TableSectionData } from '../../../types/resume';
import { EditableContent } from '../EditableContent';
import {
  Plus,
  Minus,
  Columns,
  Trash2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface TableSectionProps {
  section: TableSectionData;
}

interface ContextMenuState {
  x: number;
  y: number;
  colIdx: number;
  rowIdx: number; // -1 for th
}

export const TableSection: React.FC<TableSectionProps> = ({ section }) => {
  const {
    resumeData,
    addTableRow,
    deleteTableRow,
    addTableColumn,
    deleteTableColumn,
    toggleTableBorders,
    updateTableCell,
    updateSection,
  } = useResume();

  const tableRef = useRef<HTMLTableElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const isProfile = section.variant === 'profile';

  // Close context menu on outside click or escape
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

  // Compute active column widths as percentages summing to 100%
  const getActiveWidths = (): number[] => {
    if (colCount <= 0) return [];
    if (section.colWidths && section.colWidths.length === colCount) {
      return section.colWidths;
    }
    if (isProfile && colCount === 2) {
      return [35, 65];
    }
    const defaultWidth = Math.round((100 / colCount) * 10) / 10;
    return Array(colCount).fill(defaultWidth);
  };

  const activeWidths = getActiveWidths();

  // Reset column widths to auto/balanced distribution
  const handleResetWidths = () => {
    if (colCount <= 0) return;
    const balanced =
      isProfile && colCount === 2
        ? [35, 65]
        : Array(colCount).fill(Math.round((100 / colCount) * 10) / 10);
    updateSection(section.id, { colWidths: balanced });
  };

  // Draggable Column Resizer Handler
  const handleResizerMouseDown = (colIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tableRef.current) return;
    const table = tableRef.current;
    const tableRect = table.getBoundingClientRect();
    const tableWidth = tableRect.width;
    if (tableWidth <= 0) return;

    // Account for canvas CSS scale zoom
    const zoom = resumeData.meta.zoom || 1.0;
    const startX = e.clientX;

    const currentWidths = [...activeWidths];
    const startWidthA = currentWidths[colIndex];
    const startWidthB = currentWidths[colIndex + 1];

    const resizerEl = e.currentTarget as HTMLElement;
    resizerEl.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    let latestWidths = currentWidths;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calculate delta in percentage coordinates
      const deltaPx = (moveEvent.clientX - startX) / zoom;
      const deltaPercent = (deltaPx / (tableWidth / zoom)) * 100;

      // Minimum width constraint (at least 6% per column)
      const minPercent = 6;
      let newWidthA = startWidthA + deltaPercent;
      let newWidthB = startWidthB - deltaPercent;

      if (newWidthA < minPercent) {
        newWidthA = minPercent;
        newWidthB = startWidthA + startWidthB - minPercent;
      } else if (newWidthB < minPercent) {
        newWidthB = minPercent;
        newWidthA = startWidthA + startWidthB - minPercent;
      }

      const next = [...currentWidths];
      next[colIndex] = Math.round(newWidthA * 10) / 10;
      next[colIndex + 1] = Math.round(newWidthB * 10) / 10;
      latestWidths = next;

      // Update <colgroup> <col> widths in DOM for butter-smooth 60fps dragging
      const colElements = table.querySelectorAll('colgroup col');
      if (colElements.length === next.length) {
        next.forEach((w, i) => {
          (colElements[i] as HTMLElement).style.width = `${w}%`;
        });
      }
    };

    const handleMouseUp = () => {
      resizerEl.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Persist column widths in state
      updateSection(section.id, { colWidths: latestWidths });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative group/table pt-5.5 print:pt-0">
      <table ref={tableRef} className={tableClasses}>
        {/* Column Group for robust percentage width distribution */}
        {colCount > 0 && (
          <colgroup>
            {activeWidths.map((widthPct, idx) => (
              <col key={idx} style={{ width: `${widthPct}%` }} />
            ))}
          </colgroup>
        )}

        {/* Headers */}
        {section.headers && section.headers.length > 0 && (
          <thead>
            <tr>
              {section.headers.map((headerText, colIdx) => (
                <th
                  key={colIdx}
                  style={activeWidths[colIdx] ? { width: `${activeWidths[colIdx]}%` } : undefined}
                  className="relative group/th"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      colIdx,
                      rowIdx: -1,
                    });
                  }}
                >
                  {/* Floating Column Action Pill */}
                  <div
                    className={`column-actions-pill absolute -top-6.5 opacity-0 group-hover/th:opacity-100 group-focus-within/th:opacity-100 transition-all duration-150 bg-neutral-900 text-white rounded shadow-md px-1 py-0.5 flex items-center gap-0.5 z-30 no-print text-[10px] pointer-events-auto border border-neutral-700/80 ${
                      colIdx === 0
                        ? 'left-0'
                        : colIdx === colCount - 1
                        ? 'right-0'
                        : 'left-1/2 -translate-x-1/2'
                    }`}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        addTableColumn(section.id, colIdx);
                      }}
                      title="Insert column to the left"
                      className="px-1 py-0.5 hover:bg-neutral-800 active:bg-neutral-700 rounded text-neutral-200 hover:text-white flex items-center gap-0.5 cursor-pointer leading-none"
                    >
                      <Plus className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-[9px] font-semibold">Left</span>
                    </button>
                    {colCount > 1 && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTableColumn(section.id, colIdx);
                        }}
                        title="Delete this column"
                        className="px-1 py-0.5 hover:bg-red-950 active:bg-red-900 rounded text-red-300 hover:text-red-200 flex items-center gap-0.5 cursor-pointer leading-none"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-red-400" />
                        <span className="text-[9px] font-semibold">Del</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        addTableColumn(section.id, colIdx + 1);
                      }}
                      title="Insert column to the right"
                      className="px-1 py-0.5 hover:bg-neutral-800 active:bg-neutral-700 rounded text-neutral-200 hover:text-white flex items-center gap-0.5 cursor-pointer leading-none"
                    >
                      <Plus className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-[9px] font-semibold">Right</span>
                    </button>
                  </div>

                  <EditableContent
                    tagName="span"
                    html={headerText}
                    onChange={(val) => updateTableCell(section.id, 0, colIdx, val, true)}
                    placeholder="[Header]"
                    className="block w-full"
                  />
                  {colIdx < colCount - 1 && (
                    <div
                      onMouseDown={(e) => handleResizerMouseDown(colIdx, e)}
                      onDoubleClick={handleResetWidths}
                      className="resizer no-print"
                      title="Drag to resize column (Double-click to reset)"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Table Body */}
        <tbody>
          {section.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="group/row relative">
              {row.map((cellText, colIdx) => (
                <td
                  key={colIdx}
                  style={
                    !section.headers && activeWidths[colIdx]
                      ? { width: `${activeWidths[colIdx]}%` }
                      : undefined
                  }
                  className={`${isProfile || colIdx === 0 ? 'text-left' : ''} relative group/td`}
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
                  {/* Floating Column Action Pill for headerless tables (on first row) */}
                  {!section.headers && rowIdx === 0 && (
                    <div
                      className={`column-actions-pill absolute -top-6.5 opacity-0 group-hover/td:opacity-100 group-focus-within/td:opacity-100 transition-all duration-150 bg-neutral-900 text-white rounded shadow-md px-1 py-0.5 flex items-center gap-0.5 z-30 no-print text-[10px] pointer-events-auto border border-neutral-700/80 ${
                        colIdx === 0
                          ? 'left-0'
                          : colIdx === colCount - 1
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2'
                      }`}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          addTableColumn(section.id, colIdx);
                        }}
                        title="Insert column to the left"
                        className="px-1 py-0.5 hover:bg-neutral-800 active:bg-neutral-700 rounded text-neutral-200 hover:text-white flex items-center gap-0.5 cursor-pointer leading-none"
                      >
                        <Plus className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-[9px] font-semibold">Left</span>
                      </button>
                      {colCount > 1 && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTableColumn(section.id, colIdx);
                          }}
                          title="Delete this column"
                          className="px-1 py-0.5 hover:bg-red-950 active:bg-red-900 rounded text-red-300 hover:text-red-200 flex items-center gap-0.5 cursor-pointer leading-none"
                        >
                          <Trash2 className="w-2.5 h-2.5 text-red-400" />
                          <span className="text-[9px] font-semibold">Del</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          addTableColumn(section.id, colIdx + 1);
                        }}
                        title="Insert column to the right"
                        className="px-1 py-0.5 hover:bg-neutral-800 active:bg-neutral-700 rounded text-neutral-200 hover:text-white flex items-center gap-0.5 cursor-pointer leading-none"
                      >
                        <Plus className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-[9px] font-semibold">Right</span>
                      </button>
                    </div>
                  )}

                  <EditableContent
                    tagName="span"
                    html={cellText}
                    onChange={(val) => updateTableCell(section.id, rowIdx, colIdx, val, false)}
                    placeholder="[Data]"
                    className="block w-full"
                  />
                  {/* For headerless tables, place resizer handles on the first row */}
                  {!section.headers && rowIdx === 0 && colIdx < colCount - 1 && (
                    <div
                      onMouseDown={(e) => handleResizerMouseDown(colIdx, e)}
                      onDoubleClick={handleResetWidths}
                      className="resizer no-print"
                      title="Drag to resize column (Double-click to reset)"
                    />
                  )}
                </td>
              ))}

              {/* Hover row action buttons (insert row below & delete row) */}
              <td className="no-print !p-0 !border-none !w-12 text-center select-none whitespace-nowrap">
                <div className="opacity-0 group-hover/row:opacity-100 flex items-center gap-0.5 justify-center transition-opacity">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addTableRow(section.id, rowIdx + 1)}
                    title="Insert row below"
                    className="text-muted-foreground hover:text-emerald-500 p-1 rounded cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {section.rows.length > 1 && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => deleteTableRow(section.id, rowIdx)}
                      title="Delete this row"
                      className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table Action Controls */}
      <div className="table-controls no-print">
        <button
          type="button"
          onClick={() => addTableRow(section.id)}
          className="add-btn"
          title="Add a row at the end"
        >
          <Plus className="w-3 h-3" />
          <span>Row</span>
        </button>
        <button
          type="button"
          onClick={() => deleteTableRow(section.id)}
          className="del-btn"
          title="Delete the last row"
        >
          <Minus className="w-3 h-3" />
          <span>Row</span>
        </button>
        <button
          type="button"
          onClick={() => addTableColumn(section.id)}
          className="add-btn bg-cyan-700 hover:bg-cyan-800"
          title="Add a column at the end"
        >
          <Plus className="w-3 h-3" />
          <span>Col</span>
        </button>
        <button
          type="button"
          onClick={() => deleteTableColumn(section.id)}
          className="del-btn bg-amber-600 hover:bg-amber-700"
          title="Delete the last column"
        >
          <Minus className="w-3 h-3" />
          <span>Col</span>
        </button>
        <button
          type="button"
          onClick={() => toggleTableBorders(section.id)}
          className={`toggle-border-btn ${
            section.showColBorders ? 'bg-primary text-primary-foreground' : ''
          }`}
          title="Toggle vertical column lines"
        >
          <Columns className="w-3 h-3" />
          <span>Col Lines</span>
        </button>
        <button
          type="button"
          onClick={handleResetWidths}
          className="toggle-border-btn bg-neutral-600 hover:bg-neutral-700"
          title="Reset and equalize column widths"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Auto Width</span>
        </button>
      </div>

      {/* Custom Context Menu on Right Click */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 260),
            left: Math.min(contextMenu.x, window.innerWidth - 210),
          }}
          className="fixed z-50 min-w-[190px] bg-neutral-900 text-neutral-100 border border-neutral-700 rounded-md shadow-2xl py-1 text-xs select-none no-print animate-in fade-in-50 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Column {contextMenu.colIdx + 1}
          </div>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 active:bg-neutral-700 flex items-center gap-2 cursor-pointer text-neutral-200 hover:text-white"
            onClick={() => {
              addTableColumn(section.id, contextMenu.colIdx);
              setContextMenu(null);
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Insert column left</span>
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 active:bg-neutral-700 flex items-center gap-2 cursor-pointer text-neutral-200 hover:text-white"
            onClick={() => {
              addTableColumn(section.id, contextMenu.colIdx + 1);
              setContextMenu(null);
            }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Insert column right</span>
          </button>
          {colCount > 1 && (
            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-red-950 active:bg-red-900 text-red-300 hover:text-red-200 flex items-center gap-2 cursor-pointer"
              onClick={() => {
                deleteTableColumn(section.id, contextMenu.colIdx);
                setContextMenu(null);
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete column</span>
            </button>
          )}

          {contextMenu.rowIdx >= 0 && (
            <>
              <div className="h-px bg-neutral-800 my-1" />
              <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Row {contextMenu.rowIdx + 1}
              </div>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 active:bg-neutral-700 flex items-center gap-2 cursor-pointer text-neutral-200 hover:text-white"
                onClick={() => {
                  addTableRow(section.id, contextMenu.rowIdx);
                  setContextMenu(null);
                }}
              >
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert row above</span>
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 active:bg-neutral-700 flex items-center gap-2 cursor-pointer text-neutral-200 hover:text-white"
                onClick={() => {
                  addTableRow(section.id, contextMenu.rowIdx + 1);
                  setContextMenu(null);
                }}
              >
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert row below</span>
              </button>
              {section.rows.length > 1 && (
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 hover:bg-red-950 active:bg-red-900 text-red-300 hover:text-red-200 flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    deleteTableRow(section.id, contextMenu.rowIdx);
                    setContextMenu(null);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Delete row</span>
                </button>
              )}
            </>
          )}

          <div className="h-px bg-neutral-800 my-1" />
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 active:bg-neutral-700 flex items-center gap-2 cursor-pointer text-neutral-200 hover:text-white"
            onClick={() => {
              handleResetWidths();
              setContextMenu(null);
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset & equalize widths</span>
          </button>
        </div>
      )}
    </div>
  );
};
