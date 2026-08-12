import React from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Loader from '../Loader/Loader';
import './Table.css';

/**
 * Reusable Enterprise Table Component
 * - Sticky table header (thead never scrolls)
 * - Scrollable tbody with custom thin scrollbar
 * - Accepts maxHeight prop for fixed-height internal scroll container
 * - Supports: loading skeleton, empty state, searchable toolbar, pagination
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyText = 'No data available',
  searchable = false,
  searchValue = '',
  onSearchChange,
  pagination = null,
  onRowClick,
  maxHeight = null,   // e.g. '380px' to enable fixed-height internal scroll
  className = ''
}) => {
  return (
    <div className={`hrms-table-container ${className}`}>
      {/* Search / Toolbar header */}
      {searchable && (
        <div className="hrms-table-toolbar">
          <div className="hrms-table-search-wrapper">
            <Input
              type="search"
              placeholder="Search records..."
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ padding: '24px' }}>
          <Loader.Skeleton type="title" />
          <Loader.Skeleton rows={5} />
        </div>
      ) : data.length === 0 ? (
        /* Empty State */
        <div className="hrms-table-empty">
          <span className="hrms-table-empty-icon">📁</span>
          <span className="hrms-table-empty-text">{emptyText}</span>
        </div>
      ) : (
        /* Table with sticky thead + scrollable tbody */
        <div className="hrms-table-outer">
          {/* Sticky Header — rendered outside scroll area so it never moves */}
          <table className="hrms-table hrms-table-head-only" aria-hidden="true">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    style={{
                      width: col.width || 'auto',
                      textAlign: col.align || 'left'
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
          </table>

          {/* Scrollable Body */}
          <div
            className="hrms-table-scroll-body"
            style={maxHeight ? { maxHeight, overflowY: 'auto' } : {}}
          >
            <table className="hrms-table">
              {/* Hidden thead for column widths to match visible header above */}
              <thead className="hrms-table-hidden-head" aria-hidden="true">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={col.key || idx}
                      style={{
                        width: col.width || 'auto',
                        textAlign: col.align || 'left',
                        visibility: 'hidden',
                        padding: '0',
                        height: '0',
                        border: 'none'
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={row._id || row.id || rowIndex}
                    className={onRowClick ? 'hrms-table-row-clickable' : ''}
                    onClick={() => onRowClick && onRowClick(row, rowIndex)}
                  >
                    {columns.map((col, colIndex) => {
                      const cellValue = row[col.key];
                      return (
                        <td
                          key={col.key || colIndex}
                          style={{ textAlign: col.align || 'left' }}
                        >
                          {col.render ? col.render(row, rowIndex) : cellValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && (
        <div className="hrms-table-pagination">
          <div className="hrms-table-pagination-info">
            Showing Page <strong>{pagination.currentPage || 1}</strong> of{' '}
            <strong>{pagination.totalPages || 1}</strong>
            {pagination.totalItems ? ` (${pagination.totalItems} total records)` : ''}
          </div>
          <div className="hrms-table-pagination-actions">
            <Button
              variant="secondary"
              size="sm"
              disabled={(pagination.currentPage || 1) <= 1}
              onClick={() =>
                pagination.onPageChange && pagination.onPageChange(pagination.currentPage - 1)
              }
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={(pagination.currentPage || 1) >= (pagination.totalPages || 1)}
              onClick={() =>
                pagination.onPageChange && pagination.onPageChange(pagination.currentPage + 1)
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
