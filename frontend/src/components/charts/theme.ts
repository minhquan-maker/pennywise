// Shared chart styling — recessive axes/grid, text in text tokens (never series colours).
// Income/spending pair validated for CVD on the white surface (dataviz validate_palette, light mode):
// the green sits well above the orange in lightness so the two never collapse for red-green readers.
export const CHART = {
  income: '#7cc84a',
  expense: '#d95926',
  /** Single-series lines (spending pace, forecast): forest ink stroke over a lime wash */
  ink: '#163300',
  wash: '#9fe870',
  budget: '#868685',
  muted: '#d5d9d1',
  grid: '#e8ebe6',
  axis: { fontSize: 11, fill: '#6a6c6a' },
  tooltip: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e5df',
    borderRadius: 10,
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    color: '#0e0f0c',
    fontSize: 12,
    padding: '8px 12px',
  },
  tooltipLabel: { color: '#454745', fontWeight: 600, marginBottom: 4 },
  tooltipItem: { color: '#0e0f0c', padding: 0 },
  cursor: { fill: 'rgba(22,51,0,0.05)' },
  cursorLine: { stroke: '#c8ccc4' },
}
