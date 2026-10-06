// Shared chart styling — recessive axes/grid, text in text tokens (never series colours).
export const CHART = {
  income: '#5cf03a',
  expense: '#d95926',
  budget: '#a9b8ab',
  grid: '#1f3526',
  axis: { fontSize: 11, fill: '#6f8274' },
  tooltip: {
    backgroundColor: '#142419',
    border: '1px solid #2c4834',
    borderRadius: 12,
    boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
    color: '#f2f6ef',
    fontSize: 12,
    padding: '8px 12px',
  },
  tooltipLabel: { color: '#a9b8ab', fontWeight: 600, marginBottom: 4 },
  tooltipItem: { color: '#f2f6ef', padding: 0 },
  cursor: { fill: 'rgba(92,240,58,0.06)' },
}
