/**
 * Hand-drawn SVG decor for the lū'au theme:
 * - Pikake (Arabian jasmine) — Nanna's favorite flower: small rounded
 *   five-petal white blossoms with a soft center, often strung as lei.
 * - Laua'e fern — broad, glossy fronds with fingered lobes, the classic
 *   Hawaiian lū'au table/border greenery.
 */

/** A single pikake blossom: five overlapping rounded petals. */
export function Pikake({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className={className}
      style={style}
      fill="none"
    >
      {[0, 72, 144, 216, 288].map(deg => (
        <ellipse
          key={deg}
          cx="32"
          cy="17"
          rx="9.5"
          ry="13"
          fill="currentColor"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="5.5" fill="currentColor" opacity="0.55" />
      <circle cx="32" cy="32" r="2.5" fill="#e9c46a" opacity="0.9" />
    </svg>
  );
}

/** A strand of pikake blossoms — like a lei being strung. */
export function PikakeStrand({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-2 ${className}`}>
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-current opacity-40" />
      <Pikake className="h-4 w-4 opacity-70" />
      <Pikake className="h-6 w-6" />
      <Pikake className="h-4 w-4 opacity-70" />
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-current opacity-40" />
    </div>
  );
}

/** A laua'e fern frond: long arching midrib with paired fingered lobes. */
export function LauaeFrond({
  className = "",
  style,
  flip = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 120"
      className={className}
      style={style}
      fill="currentColor"
      transform={flip ? "scale(-1,1)" : undefined}
    >
      {/* arching midrib */}
      <path d="M6 112 C58 102 148 62 210 12 l4 5 C152 68 62 108 8 118 Z" opacity="0.9" />
      {/* broad laua'e lobes — wide, rounded, overlapping pairs */}
      {[
        [30, 104, -30], [56, 94, -33], [82, 82, -36], [108, 70, -39],
        [134, 57, -42], [160, 44, -45], [184, 31, -48],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path
            d="M0 0 C4 -14 16 -24 30 -25 C40 -25 46 -18 44 -10 C42 -2 30 3 16 4 C8 4 2 3 0 0 Z"
            opacity={0.8 - i * 0.05}
          />
          <path
            d="M2 3 C8 14 20 22 33 22 C42 21 46 14 43 7 C39 0 27 -3 14 -1 C7 0 3 1 2 3 Z"
            opacity={0.68 - i * 0.05}
          />
        </g>
      ))}
    </svg>
  );
}

/** Horizontal laua'e border row — fronds marching along a section edge. */
export function LauaeBorder({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none flex items-end justify-center overflow-hidden ${className}`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <LauaeFrond
          key={i}
          flip={i % 2 === 1}
          className="h-10 w-24 shrink-0 sm:h-12 sm:w-28"
          style={{ opacity: 0.5 + (i % 3) * 0.12 }}
        />
      ))}
    </div>
  );
}
