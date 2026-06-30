// Thin wrapper around the existing `table.list` styling so every role's tables
// look and behave identically (and scroll on mobile via the global CSS).
export default function DataTable({ columns, rows, renderRow, empty }) {
  if (!rows.length && empty) return empty;
  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="list">
        <thead>
          <tr>{columns.map((c) => <th key={c.key || c}>{c.label ?? c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => renderRow(row, i))}
        </tbody>
      </table>
    </div>
  );
}
