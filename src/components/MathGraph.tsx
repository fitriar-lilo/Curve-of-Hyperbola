import React, { useState } from 'react';
import { GraphConfig } from '../types';
import { MathView } from './MathView';

interface MathGraphProps {
  config: GraphConfig;
  width?: number;
  height?: number;
  interactive?: boolean;
  className?: string;
  title?: string;
}

export const MathGraph: React.FC<MathGraphProps> = ({
  config,
  width = 380,
  height = 340,
  interactive = false,
  className = '',
  title,
}) => {
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; px: number; py: number } | null>(null);

  const xMin = config.xRange ? config.xRange[0] : -7;
  const xMax = config.xRange ? config.xRange[1] : 7;
  const yMin = config.yRange ? config.yRange[0] : -7;
  const yMax = config.yRange ? config.yRange[1] : 7;

  const padding = 34;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  // Convert math coords to SVG canvas pixels
  const toSvgX = (x: number): number => {
    return padding + ((x - xMin) / (xMax - xMin)) * plotWidth;
  };

  const toSvgY = (y: number): number => {
    return padding + ((yMax - y) / (yMax - yMin)) * plotHeight;
  };

  // Convert SVG pixels back to math coords
  const toMathCoords = (px: number, py: number) => {
    const x = xMin + ((px - padding) / plotWidth) * (xMax - xMin);
    const y = yMax - ((py - padding) / plotHeight) * (yMax - yMin);
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (width / rect.width);
    const py = (e.clientY - rect.top) * (height / rect.height);
    if (px >= padding && px <= width - padding && py >= padding && py <= height - padding) {
      const { x, y } = toMathCoords(px, py);
      setHoverCoord({ x, y, px, py });
    } else {
      setHoverCoord(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  // Generate ticks
  const xTicks: number[] = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    if (x !== 0) xTicks.push(x);
  }

  const yTicks: number[] = [];
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    if (y !== 0) yTicks.push(y);
  }

  // Draw Hyperbola branches: left (x < 0) and right (x > 0)
  const renderHyperbolaPaths = () => {
    const a = config.a ?? 1;
    const b = config.b ?? 0;

    const buildBranchPath = (startX: number, endX: number, steps: number = 180) => {
      const points: string[] = [];
      const dx = (endX - startX) / steps;
      let started = false;

      for (let i = 0; i <= steps; i++) {
        const x = startX + i * dx;
        if (Math.abs(x) < 0.04) continue;
        const y = a / x + b;

        // Clamp y to slightly outside bounding box to keep SVG curves visually smooth
        const clampedY = Math.max(yMin - 3, Math.min(yMax + 3, y));
        const px = toSvgX(x);
        const py = toSvgY(clampedY);

        if (!started) {
          points.push(`M ${px.toFixed(1)} ${py.toFixed(1)}`);
          started = true;
        } else {
          points.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
        }
      }
      return points.join(' ');
    };

    // Left branch: from xMin to near 0
    const leftPath = buildBranchPath(xMin, -0.06);
    // Right branch: from near 0 to xMax
    const rightPath = buildBranchPath(0.06, xMax);

    return (
      <g className="hyperbola-curves">
        <path
          d={leftPath}
          fill="none"
          stroke="#818cf8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
        />
        <path
          d={rightPath}
          fill="none"
          stroke="#818cf8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
        />
      </g>
    );
  };

  // Draw Quadratic parabola
  const renderQuadraticPath = () => {
    const qa = config.quadA ?? 1;
    const qb = config.quadB ?? 0;
    const qc = config.quadC ?? 0;

    const steps = 180;
    const dx = (xMax - xMin) / steps;
    const points: string[] = [];
    let started = false;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = qa * x * x + qb * x + qc;
      const clampedY = Math.max(yMin - 4, Math.min(yMax + 4, y));
      const px = toSvgX(x);
      const py = toSvgY(clampedY);

      if (!started) {
        points.push(`M ${px.toFixed(1)} ${py.toFixed(1)}`);
        started = true;
      } else {
        points.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
      }
    }

    return (
      <path
        d={points.join(' ')}
        fill="none"
        stroke="#c084fc"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]"
      />
    );
  };

  // Highlight points
  const pointsToRender = [...(config.highlightPoints || [])];
  if (config.type === 'hyperbola' && config.a !== undefined && pointsToRender.length === 0) {
    // Add default readable integer points for hyperbola
    const a = config.a;
    const b = config.b ?? 0;
    const candidateX = [1, -1, 2, -2, 3, -3, a, -a];
    const uniqueX = Array.from(new Set(candidateX)).filter(
      (x) => x !== 0 && Math.abs(x) <= Math.min(Math.abs(a), 6) && a % x === 0
    );
    uniqueX.forEach((x) => {
      const y = a / x + b;
      if (y >= yMin && y <= yMax && x >= xMin && x <= xMax) {
        pointsToRender.push({ x, y, label: `(${x}, ${y})` });
      }
    });
  }

  const showAsymptotes = config.type === 'hyperbola' && (config.showAsymptotes !== false);
  const horizAsymptoteY = config.b ?? 0;

  return (
    <div className={`relative inline-block select-none overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800 ${className}`}>
      {title && (
        <div className="bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 border-b border-slate-800 flex items-center justify-between">
          <span>{title}</span>
          {config.type === 'hyperbola' && (
            <span className="text-[11px] text-indigo-300 font-semibold">
              <MathView
                latex={`y = ${(config.a ?? 1) >= 0 ? `\\frac{${config.a ?? 1}}{x}` : `-\\frac{${Math.abs(config.a ?? 1)}}{x}`}${
                  (config.b ?? 0) > 0 ? ` + ${config.b}` : (config.b ?? 0) < 0 ? ` - ${Math.abs(config.b ?? 0)}` : ''
                }`}
              />
            </span>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <clipPath id={`plot-clip-${width}-${height}`}>
            <rect x={padding} y={padding} width={plotWidth} height={plotHeight} rx="4" />
          </clipPath>
          <marker
            id="axis-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
          </marker>
        </defs>

        {/* Background plot area */}
        <rect
          x={padding}
          y={padding}
          width={plotWidth}
          height={plotHeight}
          fill="#090d16"
          rx="4"
        />

        {/* Grid lines */}
        <g stroke="#1e293b" strokeWidth="0.8" opacity="0.6">
          {xTicks.map((x) => (
            <line
              key={`grid-x-${x}`}
              x1={toSvgX(x)}
              y1={padding}
              x2={toSvgX(x)}
              y2={height - padding}
              strokeDasharray={x % 2 === 0 ? undefined : '2,2'}
            />
          ))}
          {yTicks.map((y) => (
            <line
              key={`grid-y-${y}`}
              x1={padding}
              y1={toSvgY(y)}
              x2={width - padding}
              y2={toSvgY(y)}
              strokeDasharray={y % 2 === 0 ? undefined : '2,2'}
            />
          ))}
        </g>

        {/* Main Axes */}
        {/* X-Axis (y = 0) */}
        {0 >= yMin && 0 <= yMax && (
          <g>
            <line
              x1={padding - 6}
              y1={toSvgY(0)}
              x2={width - padding + 10}
              y2={toSvgY(0)}
              stroke="#94a3b8"
              strokeWidth="1.75"
              markerEnd="url(#axis-arrow)"
            />
            <text
              x={width - padding + 12}
              y={toSvgY(0) + 4}
              fill="#94a3b8"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              x
            </text>
          </g>
        )}

        {/* Y-Axis (x = 0) */}
        {0 >= xMin && 0 <= xMax && (
          <g>
            <line
              x1={toSvgX(0)}
              y1={height - padding + 6}
              x2={toSvgX(0)}
              y2={padding - 10}
              stroke="#94a3b8"
              strokeWidth="1.75"
              markerEnd="url(#axis-arrow)"
            />
            <text
              x={toSvgX(0) - 4}
              y={padding - 12}
              fill="#94a3b8"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="end"
            >
              y
            </text>
          </g>
        )}

        {/* Tick labels */}
        <g fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
          {xTicks
            .filter((x) => x % 2 === 0)
            .map((x) => (
              <g key={`lbl-x-${x}`}>
                <line
                  x1={toSvgX(x)}
                  y1={toSvgY(0) - 3}
                  x2={toSvgX(x)}
                  y2={toSvgY(0) + 3}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
                <text x={toSvgX(x)} y={toSvgY(0) + 13}>
                  {x}
                </text>
              </g>
            ))}

          {yTicks
            .filter((y) => y % 2 === 0)
            .map((y) => (
              <g key={`lbl-y-${y}`}>
                <line
                  x1={toSvgX(0) - 3}
                  y1={toSvgY(y)}
                  x2={toSvgX(0) + 3}
                  y2={toSvgY(y)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
                <text x={toSvgX(0) - 8} y={toSvgY(y) + 3} textAnchor="end">
                  {y}
                </text>
              </g>
            ))}
          {/* Origin zero */}
          <text x={toSvgX(0) - 7} y={toSvgY(0) + 12} fill="#64748b">
            0
          </text>
        </g>

        {/* Asymptotes for Hyperbola (dashed) */}
        {showAsymptotes && (
          <g clipPath={`url(#plot-clip-${width}-${height})`}>
            {/* Vertical Asymptote x = 0 (along the y-axis, shown with prominent amber dash) */}
            <line
              x1={toSvgX(0)}
              y1={padding}
              x2={toSvgX(0)}
              y2={height - padding}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="5,4"
              opacity="0.9"
            />
            {/* Horizontal Asymptote y = b */}
            <line
              x1={padding}
              y1={toSvgY(horizAsymptoteY)}
              x2={width - padding}
              y2={toSvgY(horizAsymptoteY)}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="6,4"
              opacity="0.95"
            />
          </g>
        )}

        {/* Asymptote Labels */}
        {showAsymptotes && (
          <g fontSize="10" fontWeight="600" fontFamily="monospace">
            {/* Horizontal asymptote badge */}
            <g transform={`translate(${width - padding - 54}, ${Math.max(padding + 14, Math.min(height - padding - 8, toSvgY(horizAsymptoteY) - 6))})`}>
              <rect x="-4" y="-11" width="56" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="24" y="0" fill="#38bdf8" textAnchor="middle">
                y = {horizAsymptoteY}
              </text>
            </g>
            {/* Vertical asymptote badge */}
            <g transform={`translate(${toSvgX(0) + 8}, ${padding + 16})`}>
              <rect x="-3" y="-11" width="46" height="15" rx="3" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
              <text x="20" y="0" fill="#fbbf24" textAnchor="middle">
                x = 0
              </text>
            </g>
          </g>
        )}

        {/* Curves (Clipped to inner plot area) */}
        <g clipPath={`url(#plot-clip-${width}-${height})`}>
          {config.type === 'hyperbola' && renderHyperbolaPaths()}
          {config.type === 'quadratic' && renderQuadraticPath()}

          {/* Highlight Points */}
          {pointsToRender.map((pt, idx) => {
            const px = toSvgX(pt.x);
            const py = toSvgY(pt.y);
            return (
              <g key={`pt-${idx}`} className="group">
                <circle cx={px} cy={py} r="6" fill="#38bdf8" opacity="0.3" />
                <circle cx={px} cy={py} r="3.5" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
                {pt.label && width > 260 && (
                  <g>
                    <rect
                      x={px + 6}
                      y={py - 16}
                      width={pt.label.length * 6.5 + 8}
                      height="14"
                      rx="3"
                      fill="#020617"
                      stroke="#334155"
                      strokeWidth="0.8"
                    />
                    <text
                      x={px + 10}
                      y={py - 6}
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {pt.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Quadrant labels relative to asymptotes if requested */}
        {config.showQuadrants && config.type === 'hyperbola' && (
          <g fontSize="11" fontWeight="bold" opacity="0.45" fill="#94a3b8">
            <text x={toSvgX(3.5)} y={toSvgY(horizAsymptoteY + 3)}>Quadrant 1</text>
            <text x={toSvgX(-4.5)} y={toSvgY(horizAsymptoteY + 3)}>Quadrant 2</text>
            <text x={toSvgX(-4.5)} y={toSvgY(horizAsymptoteY - 3)}>Quadrant 3</text>
            <text x={toSvgX(3.5)} y={toSvgY(horizAsymptoteY - 3)}>Quadrant 4</text>
          </g>
        )}

        {/* Interactive Hover crosshair */}
        {hoverCoord && interactive && (
          <g>
            <line
              x1={hoverCoord.px}
              y1={padding}
              x2={hoverCoord.px}
              y2={height - padding}
              stroke="#94a3b8"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={hoverCoord.py}
              x2={width - padding}
              y2={hoverCoord.py}
              stroke="#94a3b8"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
            <circle cx={hoverCoord.px} cy={hoverCoord.py} r="4" fill="#f43f5e" />
            <rect
              x={Math.min(width - 80, Math.max(10, hoverCoord.px + 8))}
              y={Math.min(height - 25, Math.max(10, hoverCoord.py - 24))}
              width="68"
              height="20"
              rx="4"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="1"
            />
            <text
              x={Math.min(width - 80, Math.max(10, hoverCoord.px + 8)) + 34}
              y={Math.min(height - 25, Math.max(10, hoverCoord.py - 24)) + 14}
              fill="#f8fafc"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              ({hoverCoord.x}, {hoverCoord.y})
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
