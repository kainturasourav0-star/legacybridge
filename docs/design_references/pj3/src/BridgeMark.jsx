export default function BridgeMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M11 6H7.5A1.5 1.5 0 0 0 6 7.5v17A1.5 1.5 0 0 0 7.5 26H11M21 6h3.5A1.5 1.5 0 0 1 26 7.5v17a1.5 1.5 0 0 1-1.5 1.5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 11h10M11 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="11" r="2" fill="currentColor" />
      <circle cx="16" cy="21" r="2" fill="currentColor" />
    </svg>
  );
}
