import React, { useRef, useState, useEffect } from 'react';
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
  onAddLeft: () => void;
  onDelete: () => void;
  onAddRight: () => void;
}

const ColumnActionsPill: React.FC<ColumnActionsPillProps> = ({
  colIdx,
  colCount,
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
      className={`column-actions-pill absolute -top-5.5 rounded-md px-1 py-0.5 flex items-center gap-0.5 z-30 no-print text-[11px] leading-none ${alignClass}`}
      style={{
        backgroundColor: '#ffffff',
        color: '#242424',
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

export const TableSection: React.FC<TableSectionProps> = ({ section }) => {
  const {
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

  const handleResizerMouseDown = (colIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tableRef.current) return;
    const table = tableRef.current;
    const tableWidth = table.getBoundingClientRect().width;
    if (tableWidth <= 0) return;

    const startX = e.clientX;
    const currentWidths = [...activeWidths];
    const startWidthA = currentWidths[colIndex];
    const startWidthB = currentWidths[colIndex + 1];
    const pairTotal = Math.round((startWidthA + startWidthB) * 10) / 10;

    const resizerEl = e.currentTarget as HTMLElement;
    resizerEl.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    let latestWidths = currentWidths;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // clientX delta and table.getBoundingClientRect().width are both in zoomed screen pixels
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

    const handleMouseUp = () => {
      resizerEl.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      updateSection(section.id, { colWidths: latestWidths });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative pt-5 print:pt-0">
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
                <th
                  key={colIdx}
                  className="relative"
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
                  <ColumnActionsPill
                    colIdx={colIdx}
                    colCount={colCount}
                    onAddLeft={() => addTableColumn(section.id, colIdx)}
                    onDelete={() => deleteTableColumn(section.id, colIdx)}
                    onAddRight={() => addTableColumn(section.id, colIdx + 1)}
                  />

                  <EditableContent
                    tagName="div"
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
                      title="Drag to resize column (Double-click to balance)"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {section.rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cellText, colIdx) => (
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
                  {!section.headers && rowIdx === 0 && (
                    <ColumnActionsPill
                      colIdx={colIdx}
                      colCount={colCount}
                      onAddLeft={() => addTableColumn(section.id, colIdx)}
                      onDelete={() => deleteTableColumn(section.id, colIdx)}
                      onAddRight={() => addTableColumn(section.id, colIdx + 1)}
                    />
                  )}

                  <EditableContent
                    tagName="div"
                    html={cellText}
                    onChange={(val) => updateTableCell(section.id, rowIdx, colIdx, val, false)}
                    placeholder="[Data]"
                    className="block w-full"
                  />

                  {colIdx === row.length - 1 && (
                    <div
                      className="row-actions-pill absolute -right-10 top-1/2 -translate-y-1/2 rounded-md px-1 py-0.5 flex items-center gap-0.5 z-30 no-print text-[11px]"
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

                  {!section.headers && rowIdx === 0 && colIdx < colCount - 1 && (
                    <div
                      onMouseDown={(e) => handleResizerMouseDown(colIdx, e)}
                      onDoubleClick={handleResetWidths}
                      className="resizer no-print"
                      title="Drag to resize column (Double-click to balance)"
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

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
            top: Math.min(contextMenu.y, window.innerHeight - 260),
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
