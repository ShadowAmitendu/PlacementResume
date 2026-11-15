import React, { useRef } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { TableSectionData } from '../../../types/resume';
import { EditableContent } from '../EditableContent';
import { Plus, Minus, Columns, Trash2, RotateCcw } from 'lucide-react';

interface TableSectionProps {
  section: TableSectionData;
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
  const isProfile = section.variant === 'profile';

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
    <div className="relative group/table">
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
                  className="relative"
                >
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
                  className={`${isProfile || colIdx === 0 ? 'text-left' : ''} relative`}
                >
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

              {/* Hover row delete button */}
              {section.rows.length > 1 && (
                <td className="no-print !p-0 !border-none !w-6 text-center select-none">
                  <button
                    type="button"
                    onClick={() => deleteTableRow(section.id, rowIdx)}
                    title="Delete this row"
                    className="opacity-0 group-hover/row:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              )}
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
          title="Add a row"
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
          title="Add a column"
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
    </div>
  );
};
