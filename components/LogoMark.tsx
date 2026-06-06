import * as React from "react";

/** Circular Don Social Bar emblem (DRINKS EXPERTS / 20 DON 23 / SOCIAL BAR). */
export function LogoMark({
  size = 40,
  bg = "var(--bg-deep)",
  className,
}: {
  size?: number;
  bg?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Don Social Bar — Drinks Experts"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="58" fill={bg} stroke="var(--border)" strokeWidth="1" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="3,3" />
      
      {/* Curved path for DRINKS EXPERTS */}
      <path id="curve-top" d="M 24,56 A 36,36 0 0,1 96,56" fill="none" />
      <text fontSize="7.5" fontWeight="600" letterSpacing="2.5" fill="var(--accent)" fontFamily="var(--font-condensed)">
        <textPath href="#curve-top" startOffset="50%" textAnchor="middle">
          DRINKS EXPERTS
        </textPath>
      </text>
      
      {/* Left/Right Year */}
      <text x="25" y="67" fontSize="9" fontWeight="600" fill="var(--accent)" fontFamily="var(--font-condensed)" textAnchor="middle">20</text>
      <text x="95" y="67" fontSize="9" fontWeight="600" fill="var(--accent)" fontFamily="var(--font-condensed)" textAnchor="middle">23</text>
      
      {/* Large DON in center (with 3D stroke outline) */}
      <text
        x="60.5" y="71.5" textAnchor="middle"
        fontFamily="var(--font-condensed)" fontSize="32" fontWeight="900"
        letterSpacing="1" fill="var(--bg-deep)" stroke="var(--accent)" strokeWidth="3"
        strokeLinejoin="round"
      >
        DON
      </text>
      <text
        x="60" y="70" textAnchor="middle"
        fontFamily="var(--font-condensed)" fontSize="32" fontWeight="900"
        letterSpacing="1" fill="var(--fg)"
      >
        DON
      </text>
      
      {/* SOCIAL BAR at bottom */}
      <text
        x="60" y="93" textAnchor="middle"
        fontFamily="var(--font-condensed)" fontSize="9" fontWeight="600"
        letterSpacing="3.5" fill="var(--accent)"
      >
        SOCIAL BAR
      </text>
    </svg>
  );
}

/** Wordmark used as the "no photo" placeholder art (inherits color via currentColor). */
export function PlaceholderMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
      <text
        x="60" y="68" textAnchor="middle"
        fontFamily="var(--font-condensed)" fontSize="32" fontWeight="900"
        letterSpacing="1" fill="currentColor"
      >
        DON
      </text>
      <text
        x="60" y="85" textAnchor="middle"
        fontFamily="var(--font-condensed)" fontSize="8.5" fontWeight="600"
        letterSpacing="3" fill="currentColor" opacity="0.7"
      >
        SOCIAL BAR
      </text>
    </svg>
  );
}

