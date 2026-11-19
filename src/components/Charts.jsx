import React, { useState } from 'react';
import { formatIDR } from '../utils/formatters';

const formatAxisNumber = (val) => {
  if (val === 0) return '0';
  if (val >= 1000000) {
    const m = val / 1000000;
    return Number.isInteger(m) ? `${m}jt` : `${m.toFixed(1)}jt`;
  }
  if (val >= 1000) {
    return `${Math.round(val / 1000)}rb`;
  }
  return String(val);
};

const computeNiceMax = (rawMax, fallbackMax = 600000) => {
  if (!rawMax || rawMax <= 0) return fallbackMax;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const normalized = rawMax / magnitude;
  let stepMultiplier = 1;
  if (normalized <= 1.2) stepMultiplier = 1.2;
  else if (normalized <= 2) stepMultiplier = 2;
  else if (normalized <= 3) stepMultiplier = 3;
  else if (normalized <= 4) stepMultiplier = 4;
  else if (normalized <= 6) stepMultiplier = 6;
  else if (normalized <= 8) stepMultiplier = 8;
  else stepMultiplier = 10;

  const nice = Math.ceil(stepMultiplier * magnitude);
  const step = Math.ceil(nice / 4 / 1000) * 1000 || Math.ceil(nice / 4);
  return step * 4;
};

const roundedTopRectPath = (x, y, width, height, radius) => {
  if (height <= 0) return '';
  const r = Math.min(radius, width / 2, height);
  return `
    M ${x},${y + height}
    L ${x},${y + r}
    Q ${x},${y} ${x + r},${y}
    L ${x + width - r},${y}
    Q ${x + width},${y} ${x + width},${y + r}
    L ${x + width},${y + height}
    Z
  `;
};

export function RevenueBarChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const safeData = data && data.length > 0 ? data : [];
  const rawMax = safeData.reduce((max, d) => (d.total > max ? d.total : max), 0);
  const niceMax = computeNiceMax(rawMax, 600000);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));

  const width = 640;
  const height = 240;
  const padLeft = 48;
  const padRight = 14;
  const padTop = 18;
  const padBottom = 32;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const count = Math.max(safeData.length, 1);
  const slotW = chartW / count;
  const barW = Math.max(6, Math.min(28, slotW * 0.62));
  const labelStep = count > 18 ? 3 : count > 10 ? 2 : 1;

  const activeItem = activeIndex !== null ? safeData[activeIndex] : null;

  return (
    <div className="relative w-full">
      {activeItem && (
        <div className="absolute top-1 right-2 z-10 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-semibold shadow-md pointer-events-none tabular-nums">
          <span className="opacity-75">
            {activeItem.tooltipLabel || activeItem.label}:
          </span>{' '}
          <span className="font-bold">{formatIDR(activeItem.total)}</span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-48 sm:h-60 select-none overflow-visible"
      >
        {ticks.map((tickVal, idx) => {
          const y = padTop + chartH - (tickVal / niceMax) * chartH;
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                className={
                  idx === 0
                    ? 'stroke-slate-300 dark:stroke-zinc-700'
                    : 'stroke-slate-200 dark:stroke-zinc-800'
                }
                strokeDasharray={idx === 0 ? undefined : '4 4'}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 dark:fill-zinc-400"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
              >
                {formatAxisNumber(tickVal)}
              </text>
            </g>
          );
        })}

        {safeData.map((d, i) => {
          const barH = d.total > 0 ? Math.max(4, (d.total / niceMax) * chartH) : 0;
          const x = padLeft + i * slotW + (slotW - barW) / 2;
          const y = padTop + chartH - barH;
          const isHovered = activeIndex === i;
          const showXLabel = i % labelStep === 0 || i === safeData.length - 1;

          return (
            <g
              key={d.key || i}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => setActiveIndex((prev) => (prev === i ? null : i))}
              className="cursor-pointer"
            >
              <rect
                x={padLeft + i * slotW}
                y={padTop}
                width={slotW}
                height={chartH}
                fill={isHovered ? 'var(--accent-soft)' : 'transparent'}
              />
              {barH > 0 && (
                <path
                  d={roundedTopRectPath(x, y, barW, barH, 4)}
                  style={{
                    fill: isHovered ? 'var(--accent-hover)' : 'var(--accent)',
                  }}
                />
              )}
              {showXLabel && (
                <text
                  x={padLeft + i * slotW + slotW / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className={
                    isHovered
                      ? 'fill-slate-900 dark:fill-zinc-100'
                      : 'fill-slate-500 dark:fill-zinc-400'
                  }
                  fontSize="10"
                  fontWeight={isHovered ? '700' : '500'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PeakHourBarChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const safeData = data && data.length > 0 ? data : [];
  const maxOrders = safeData.reduce((max, d) => (d.count > max ? d.count : max), 0);
  const niceMax = maxOrders <= 4 ? 4 : Math.ceil(maxOrders / 4) * 4;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));

  const width = 640;
  const height = 240;
  const padLeft = 36;
  const padRight = 12;
  const padTop = 18;
  const padBottom = 32;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const count = Math.max(safeData.length, 1);
  const slotW = chartW / count;
  const barW = Math.max(8, Math.min(24, slotW * 0.65));

  const activeItem = activeIndex !== null ? safeData[activeIndex] : null;

  return (
    <div className="relative w-full">
      {activeItem && (
        <div className="absolute top-1 right-2 z-10 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-semibold shadow-md pointer-events-none tabular-nums">
          <span>{activeItem.label}</span>{' '}
          <span className="opacity-50">—</span>{' '}
          <span className="font-bold">{activeItem.count} pesanan</span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-48 sm:h-60 select-none overflow-visible"
      >
        {ticks.map((tickVal, idx) => {
          const y = padTop + chartH - (tickVal / niceMax) * chartH;
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                className={
                  idx === 0
                    ? 'stroke-slate-300 dark:stroke-zinc-700'
                    : 'stroke-slate-200 dark:stroke-zinc-800'
                }
                strokeDasharray={idx === 0 ? undefined : '4 4'}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 dark:fill-zinc-400"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
              >
                {tickVal}
              </text>
            </g>
          );
        })}

        {safeData.map((d, i) => {
          const isPeak = maxOrders > 0 && d.count === maxOrders;
          const barH = d.count > 0 ? Math.max(4, (d.count / niceMax) * chartH) : 0;
          const x = padLeft + i * slotW + (slotW - barW) / 2;
          const y = padTop + chartH - barH;
          const isHovered = activeIndex === i;
          const showLabel = i % 2 === 0;

          return (
            <g
              key={d.hour}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => setActiveIndex((prev) => (prev === i ? null : i))}
              className="cursor-pointer"
            >
              <rect
                x={padLeft + i * slotW}
                y={padTop}
                width={slotW}
                height={chartH}
                fill={isHovered ? 'var(--accent-soft)' : 'transparent'}
              />
              {barH > 0 ? (
                <path
                  d={roundedTopRectPath(x, y, barW, barH, 4)}
                  style={{
                    fill: isPeak
                      ? 'var(--accent)'
                      : isHovered
                      ? 'var(--chart-muted-hover)'
                      : 'var(--chart-muted)',
                  }}
                />
              ) : (
                <line
                  x1={x}
                  y1={padTop + chartH}
                  x2={x + barW}
                  y2={padTop + chartH}
                  style={{ stroke: 'var(--chart-muted)' }}
                  strokeWidth="2"
                />
              )}
              {showLabel && (
                <text
                  x={padLeft + i * slotW + slotW / 2}
                  y={height - 10}
                  textAnchor="middle"
                  style={isPeak ? { fill: 'var(--accent-text)' } : undefined}
                  className={isPeak ? undefined : 'fill-slate-500 dark:fill-zinc-400'}
                  fontSize="10"
                  fontWeight={isPeak ? '700' : '500'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
