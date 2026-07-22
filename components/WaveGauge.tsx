"use client";

import { Level } from "@/lib/data";

const levelStyles: Record<Level, { stroke: string; amplitude: number; speed: string }> = {
  High: { stroke: "var(--danger)", amplitude: 14, speed: "2.4s" },
  Medium: { stroke: "var(--warning)", amplitude: 9, speed: "3.6s" },
  Low: { stroke: "var(--success)", amplitude: 5, speed: "5s" },
};

function buildPath(amplitude: number, phase: number) {
  const width = 240;
  const midY = 30;
  const points: string[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = midY + Math.sin((i / steps) * Math.PI * 4 + phase) * amplitude;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
}

export function WaveGauge({
  level,
  label,
  score,
}: {
  level: Level;
  label: string;
  score: number;
}) {
  const { stroke, amplitude, speed } = levelStyles[level];
  const pathA = buildPath(amplitude, 0);
  const pathB = buildPath(amplitude, Math.PI);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="font-mono text-xs text-ink-soft">{score}</span>
      </div>
      <svg viewBox="0 0 240 60" className="h-9 w-full overflow-visible">
        <path
          d={pathA}
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.9}
        >
          <animate
            attributeName="d"
            values={`${pathA};${pathB};${pathA}`}
            dur={speed}
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}

export function PulseHero() {
  return (
    <svg
      viewBox="0 0 800 200"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
    >
      <path
        d="M0,100 Q100,40 200,100 T400,100 T600,100 T800,100"
        fill="none"
        stroke="var(--accent-soft)"
        strokeWidth="1.5"
        opacity="0.5"
      >
        <animate
          attributeName="d"
          values="M0,100 Q100,40 200,100 T400,100 T600,100 T800,100;
                  M0,100 Q100,160 200,100 T400,100 T600,100 T800,100;
                  M0,100 Q100,40 200,100 T400,100 T600,100 T800,100"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M0,120 Q100,90 200,120 T400,120 T600,120 T800,120"
        fill="none"
        stroke="var(--primary-soft)"
        strokeWidth="1"
        opacity="0.35"
      >
        <animate
          attributeName="d"
          values="M0,120 Q100,90 200,120 T400,120 T600,120 T800,120;
                  M0,120 Q100,150 200,120 T400,120 T600,120 T800,120;
                  M0,120 Q100,90 200,120 T400,120 T600,120 T800,120"
          dur="11s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
