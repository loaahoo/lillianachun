/**
 * Hand-drawn SVG decor for the lū'au theme:
 * - Pikake (Arabian jasmine) — Nanna's favorite flower: small rounded
 *   five-petal white blossoms with a soft center, often strung as lei.
 * - Laua'e fern — broad, glossy fronds with fingered lobes, the classic
 *   Hawaiian lū'au table/border greenery.
 * - Maile lei — the sacred open-ended lei of twisted maile vine with
 *   paired glossy pointed leaves, draped between sections as a border.
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

/**
 * One repeatable segment of maile lei: a gently draping twisted vine with
 * pairs of glossy, lance-shaped maile leaves alternating along it.
 * viewBox 0..240 wide; the vine enters at (0,26) and exits at (240,26)
 * so segments tile seamlessly side by side.
 */
function MaileSegment({ opacity = 1 }: { opacity?: number }) {
  // leaf pairs positioned along the draped curve y = 26 + 14*sin(pi*x/240)
  const leaves: Array<[number, number, number, boolean]> = [
    // [x, y, angleDeg, above]
    [18, 30, 18, false],
    [38, 35, 24, true],
    [60, 38.5, 12, false],
    [84, 40, 4, true],
    [108, 40, -4, false],
    [132, 39, -8, true],
    [156, 36.5, -14, false],
    [180, 33, -20, true],
    [202, 29.5, -24, false],
    [222, 27, -18, true],
  ];
  return (
    <g opacity={opacity}>
      {/* twisted double vine — two intertwined strands */}
      <path
        d="M0 26 C40 38 80 41 120 41 C160 41 200 36 240 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M0 28 C42 36 82 44 120 43 C158 42 198 39 240 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* paired glossy lance-shaped maile leaves */}
      {leaves.map(([x, y, a, above], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          {/* leaf on one side */}
          <path
            d={
              above
                ? "M0 0 C4 -10 12 -17 22 -19 C16 -8 9 -2 0 0 Z"
                : "M0 0 C4 10 12 17 22 19 C16 8 9 2 0 0 Z"
            }
            fill="currentColor"
            opacity={0.85 - (i % 3) * 0.12}
          />
          {/* smaller opposing leaf for the paired look */}
          <path
            d={
              above
                ? "M2 1 C7 8 13 12 21 13 C15 5 9 2 2 1 Z"
                : "M2 -1 C7 -8 13 -12 21 -13 C15 -5 9 -2 2 -1 Z"
            }
            fill="currentColor"
            opacity={0.6 - (i % 3) * 0.1}
          />
        </g>
      ))}
    </g>
  );
}

/**
 * Maile lei border — a draped garland running the full width between
 * sections. Repeats the vine segment edge-to-edge; centered pikake
 * accent optional via `withPikake` (maile + pikake is the classic pairing).
 */
export function MaileLei({
  className = "",
  withPikake = false,
}: {
  className?: string;
  withPikake?: boolean;
}) {
  return (
    <div aria-hidden className={`pointer-events-none relative w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="xMidYMid slice"
        className="h-10 w-full sm:h-12"
        fill="none"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i} transform={`translate(${i * 240} 0)`}>
            <MaileSegment opacity={0.9} />
          </g>
        ))}
      </svg>
      {withPikake && (
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-1.5">
          <Pikake className="h-3.5 w-3.5 opacity-80" />
          <Pikake className="h-5 w-5" />
          <Pikake className="h-3.5 w-3.5 opacity-80" />
        </div>
      )}
    </div>
  );
}
