// SVG-кільце прогресу X/Y з анімацією stroke-dashoffset.
const R = 72
const C = 2 * Math.PI * R

export default function ProgressRing({ taken, total }) {
  const p = total ? taken / total : 0
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      role="img"
      aria-label={`Прийнято ${taken} з ${total}`}
    >
      <circle cx="90" cy="90" r={R} fill="none" stroke="var(--line)" strokeWidth="12" />
      <circle
        cx="90"
        cy="90"
        r={R}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - p)}
        transform="rotate(-90 90 90)"
        style={{ transition: 'stroke-dashoffset .4s' }}
      />
      <text x="90" y="88" textAnchor="middle" className="ringcenter">
        {taken}/{total}
      </text>
      <text x="90" y="108" textAnchor="middle" className="ringsub">
        ПРИЙНЯТО
      </text>
    </svg>
  )
}
