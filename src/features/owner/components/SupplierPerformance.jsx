import { FiTrendingUp } from "react-icons/fi";
import { FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";

const getLevel = (score) => {
  if (score >= 80) return { label: "Excellent", color: "var(--success-color)" };
  if (score >= 60) return { label: "Good", color: "var(--success-color)" };
  if (score >= 40) return { label: "Fair", color: "#e0a020" };
  return { label: "Low", color: "var(--error-color)" };
};

const formatPercent = (value) => `${Number(Number(value).toFixed(1))}%`;

const RING_SIZE = 64;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ score, color }) {
  const progress = Math.min(100, Math.max(0, score));

  return (
    <div
      className="relative shrink-0"
      style={{ width: RING_SIZE, height: RING_SIZE }}
    >
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - progress / 100)}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold">{Math.round(progress)}</span>
        <span className="mt-0.5 text-[9px] text-(--secondary-text-color)">
          /100
        </span>
      </div>
    </div>
  );
}

function StatBox({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-(--border-color) px-1 py-2 text-center">
      <span className="text-(--secondary-text-color)">{icon}</span>
      <span className="text-sm font-bold">{value}</span>
      <span className="text-[10px] text-(--secondary-text-color)">{label}</span>
    </div>
  );
}

function SupplierPerformance({ reliability }) {
  const hasHistory =
    reliability && reliability.score !== null && reliability.orders > 0;

  if (!hasHistory) {
    return (
      <div className="mt-4 px-3 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="text-(--secondary-text-color)">
            Supplier Performance
          </div>
        </div>
        <p className="mt-2 text-xs text-(--secondary-text-color)">
          No delivery history on KOSH yet.
        </p>
      </div>
    );
  }

  const score = Number(reliability.score);
  const level = getLevel(score);
  const orders = reliability.orders;

  return (
    <div className="mt-4 space-y-3 px-3 py-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">Supplier Performance</h4>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            color: level.color,
            backgroundColor: `color-mix(in srgb, ${level.color} 15%, transparent)`,
          }}
        >
          {level.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ScoreRing score={score} color={level.color} />

        <div className="min-w-0">
          <p className="text-sm font-semibold">Reliability Score</p>
          <p className="text-[11px] text-(--secondary-text-color)">
            Based on {orders} previous {orders === 1 ? "order" : "orders"}
          </p>
          <p
            className="mt-1 flex items-center gap-1 text-xs font-medium"
            style={{ color: level.color }}
          >
            <FiTrendingUp />
            {formatPercent(reliability.on_time_rate)} on-time delivery
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatBox
          icon={<FaCalendarAlt />}
          value={formatPercent(reliability.on_time_rate)}
          label="On-time"
        />
        <StatBox
          icon={<BsBoxSeamFill />}
          value={formatPercent(reliability.fill_rate)}
          label="Fill rate"
        />
        <StatBox
          icon={<FaCheckCircle />}
          value={formatPercent(reliability.clean_rate)}
          label="Clean rate"
        />
      </div>
    </div>
  );
}

export default SupplierPerformance;
