// Shared chart styling — recessive axes/grid, text in text tokens (never series colours).
export const CHART = {
  income: '#3dd9a0',
  expense: '#d95926',
  budget: '#a3a9b5',
  grid: '#262a31',
  axis: { fontSize: 11, fill: '#6c7380' },
  tooltip: {
    backgroundColor: '#191b20',
    border: '1px solid #353a44',
    borderRadius: 12,
    boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
    color: '#f3f4f6',
    fontSize: 12,
    padding: '8px 12px',
  },
  tooltipLabel: { color: '#a3a9b5', fontWeight: 600, marginBottom: 4 },
  tooltipItem: { color: '#f3f4f6', padding: 0 },
  cursor: { fill: 'rgba(61,217,160,0.06)' },
}
