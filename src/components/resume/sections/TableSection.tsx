import React, { useRef } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { TableSectionData } from '../../../types/resume';
import { EditableContent } from '../EditableContent';
import { Plus, Minus, Columns, Trash2 } from 'lucide-react';

interface TableSectionProps {
  section: TableSectionData;
}

export const TableSection: React.FC<TableSectionProps> = ({ section }) => {
  const {
    addTableRow,
    deleteTableRow,
    addTableColumn,
    deleteTableColumn,
    toggleTableBorders,
    updateTableCell,
  } = useResume();

  const tableRef = useRef<HTMLTableElement>(null);
  const isProfile = section.variant === 'profile';

  const tableClasses = [
    isProfile ? 'profile-table' : 'striped',
    section.showColBorders ? 'show-col-borders' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Column Resizer Handler
  const handleResizerMouseDown = (colIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tableRef.current) return;
    const table = tableRef.current;
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;

    const cell = firstRow.children[colIndex] as HTMLElement;
    if (!cell) return;

    const startX = e.clientX;
    const startW = cell.offsetWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(30, startW + (moveEvent.clientX - startX));
      cell.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const colCount = section.headers?.length || (section.rows[0] ? section.rows[0].length : 0);

  return (
    <div className="relative group/table">
      <table ref={tableRef} className={tableClasses}>
        {section.headers && section.headers.length > 0 && (
          <thead>
            <tr>
              {section.headers.map((headerText, colIdx) => (
                <EditableContent
                  key={colIdx}
                  tagName="th"
                  html={headerText}
                  onChange={(val) => updateTableCell(section.id, 0, colIdx, val, true)}
                  placeholder="[Header]"
                  className="relative"
                >
                  {colIdx < colCount - 1 && (
                    <div
                      onMouseDown={(e) => handleResizerMouseDown(colIdx, e)}
                      className="resizer no-print"
                      title="Drag to resize column"
                    />
                  )}
                </EditableContent>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {section.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="group/row relative">
              {row.map((cellText, colIdx) => (
                <EditableContent
                  key={colIdx}
                  tagName="td"
                  className={`${isProfile || colIdx === 0 ? 'text-left' : ''} relative`}
                  html={cellText}
                  onChange={(val) => updateTableCell(section.id, rowIdx, colIdx, val, false)}
                  placeholder="[Data]"
                >
                  {!section.headers && rowIdx === 0 && colIdx < colCount - 1 && (
                    <div
                      onMouseDown={(e) => handleResizerMouseDown(colIdx, e)}
                      className="resizer no-print"
                      title="Drag to resize column"
                    />
                  )}
                </EditableContent>
              ))}

              {/* Hover row delete button */}
              {section.rows.length > 1 && (
                <td className="no-print !p-0 !border-none !w-6 text-center select-none">
                  <button
                    type="button"
                    onClick={() => deleteTableRow(section.id, rowIdx)}
                    title="Delete this row"
                    className="opacity-0 group-hover/row:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded transition-opacity"
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
      </div>
    </div>
  );
};
