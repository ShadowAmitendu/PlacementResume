import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { TableSectionData } from '../../../types/resume';
import { EditableContent } from '../EditableContent';
import { Plus, Minus, Columns } from 'lucide-react';

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

  const isProfile = section.variant === 'profile';
  const tableClasses = [
    isProfile ? 'profile-table' : 'striped',
    section.showColBorders ? 'show-col-borders' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <table className={tableClasses}>
        {section.headers && section.headers.length > 0 && (
          <thead>
            <tr>
              {section.headers.map((headerText, colIdx) => (
                <th key={colIdx}>
                  <EditableContent
                    tagName="span"
                    html={headerText}
                    onChange={(val) => updateTableCell(section.id, 0, colIdx, val, true)}
                    placeholder="[Header]"
                  />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {section.rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cellText, colIdx) => (
                <td key={colIdx} className={isProfile || colIdx === 0 ? 'text-left' : ''}>
                  <EditableContent
                    tagName="span"
                    html={cellText}
                    onChange={(val) => updateTableCell(section.id, rowIdx, colIdx, val, false)}
                    placeholder="[Data]"
                  />
                </td>
              ))}
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
