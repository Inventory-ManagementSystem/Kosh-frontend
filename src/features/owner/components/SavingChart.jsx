import { useEffect, useMemo, useState } from "react";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import {
  Area,
  Bar,
  CartesianGrid,
  Rectangle,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "../../../context/AuthContext";
import { getSavingsSeries } from "../api/procurementApi";
import Info from "../../../components/common/Info";

const RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];
const DEFAULT_DAYS = 90;

const SAVED_LABEL = {
  day: "Saved that day",
  week: "Saved this week",
  month: "Saved this month",
};

const formatMoney = (value) => {
  const amount = Number(value) || 0;
  const sign = amount < 0 ? "-" : "";
  return `${sign}\u20B9${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatAxisMoney = (value) => {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 10000000) return `${sign}\u20B9${+(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${sign}\u20B9${+(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}\u20B9${+(abs / 1000).toFixed(1)}k`;
  return `${sign}\u20B9${abs}`;
};

const formatDate = (isoDate, groupBy) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const month = date.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  if (groupBy === "month") return `${month} ${date.getUTCFullYear()}`;
  return `${date.getUTCDate()} ${month}`;
};

const orderLabel = (count) => `${count} ${count === 1 ? "order" : "orders"}`;

function SavingChart() {
  const { accessToken } = useAuth();

  const [days, setDays] = useState(DEFAULT_DAYS);
  const [data, setData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    let ignore = false;

    const loadSavings = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getSavingsSeries(accessToken, days);
        if (!ignore) setData(result);
      } catch (err) {
        if (!ignore) {
          setData(null);
          setError(err.message || "Unable to load estimated savings.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadSavings();
    return () => {
      ignore = true;
    };
  }, [accessToken, days, reloadKey]);

  const chartData = useMemo(
    () =>
      (data?.points ?? []).map((point) => ({
        date: point.period_start,
        savings: Number(point.savings),
        cumulative: Number(point.cumulative),
        orders: point.orders,
        barHeight: Math.abs(Number(point.savings)),
        lineValue: Math.max(0, Number(point.cumulative)),
      })),
    [data],
  );

  const groupBy = data?.group_by || "week";
  const hasComparison = (data?.orders_compared ?? 0) > 0;

  return (
    <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center font-['Google_Sans_Flex'] text-lg font-semibold">
          Estimated Savings
          <Info text="Each confirmed order is compared with the average of the other quotations on its RFQ.These are estimates not guaranteed savings." />
        </h2>
        <div className="flex overflow-hidden rounded-lg border border-(--border-color)">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => setDays(range.days)}
              className={`px-3 py-1 text-xs font-medium transition ${
                days === range.days
                  ? "bg-(--accent-color) text-(--page-background)"
                  : "text-(--text-color) hover:text-(--accent-color)"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      {loading && !data && <ChartSkeleton />}

      {!loading && error && (
        <div className="py-10 text-center">
          <p className="text-sm text-(--secondary-text-color)">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-3 rounded-full border border-(--border-color) px-3 py-1 text-[10px] font-medium text-(--text-color) transition hover:border-(--accent-color) hover:text-(--accent-color)"
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <div
          className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}
        >
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-semibold">
              {hasComparison ? formatMoney(data.total_savings) : "—"}
            </p>
            {hasComparison && <PercentBadge value={data.savings_pct} />}
          </div>

          {hasComparison ? (
            <>
              <div className="mt-4 h-40 w-full sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="savings-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          style={{
                            stopColor: "var(--dashboard-glow)",
                            stopOpacity: 0.35,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "var(--dashboard-glow)",
                            stopOpacity: 0,
                          }}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="var(--border-color)"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => formatDate(value, groupBy)}
                      tick={{
                        fill: "var(--secondary-text-color)",
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: "var(--border-color)" }}
                      tickLine={false}
                      interval="preserveStartEnd"
                      minTickGap={32}
                    />
                    <YAxis
                      width={48}
                      tickFormatter={formatAxisMoney}
                      tick={{
                        fill: "var(--secondary-text-color)",
                        fontSize: 12,
                      }}
                      axisLine={{ stroke: "var(--border-color)" }}
                      tickLine={false}
                      domain={[0, "auto"]}
                    />
                    <Tooltip
                      content={<SavingsTooltip groupBy={groupBy} />}
                      cursor={{
                        stroke: "var(--dashboard-glow)",
                        strokeDasharray: "4 4",
                        strokeOpacity: 0.6,
                      }}
                    />
                    <Bar
                      dataKey="barHeight"
                      maxBarSize={14}
                      shape={<SavingsBar />}
                    />
                    <Area
                      type="monotone"
                      dataKey="lineValue"
                      stroke="var(--dashboard-glow)"
                      strokeWidth={2}
                      fill="url(#savings-gradient)"
                      dot={
                        chartData.length <= 12
                          ? {
                              r: 3,
                              fill: "var(--dashboard-glow)",
                              strokeWidth: 0,
                            }
                          : false
                      }
                      activeDot={{
                        r: 5,
                        fill: "var(--dashboard-glow)",
                        stroke: "var(--dashboard-glow)",
                        strokeWidth: 6,
                        strokeOpacity: 0.25,
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-4 text-xs text-(--secondary-text-color)">
                <OrdersLink>{orderLabel(data.orders_compared)}</OrdersLink>{" "}
                compared
                {data.orders_without_competition > 0 && (
                  <>
                    {" · "}
                    <OrdersLink>
                      {orderLabel(data.orders_without_competition)}
                    </OrdersLink>{" "}
                    had no competing quote
                  </>
                )}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
              <FaArrowTrendUp size={40} className="text-(--icon-color)" />
              <p className="max-w-xs text-sm text-(--secondary-text-color)">
                Not enough quotes to compare yet.Savings appear once an order
                has competing quotations.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PercentBadge({ value }) {
  const pct = Number(value) || 0;
  let style = "bg-(--border-color) text-(--secondary-text-color)";
  let arrow = "";
  if (pct > 0) {
    style = "bg-[#26af41]/20 text-(--success-color)";
    arrow = <FaCaretUp size={20} />;
  } else if (pct < 0) {
    style = "bg-[#e65757]/15 text-[#e65757]";
    arrow = <FaCaretDown size={20} />;
  }
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {arrow}
      {Math.abs(pct)}% vs average quotes
    </span>
  );
}

function OrdersLink({ children }) {
  return (
    <span className="text-(--accent-color) underline underline-offset-2 hover:text-(--accent-hover-color)">
      {children}
    </span>
  );
}

function SavingsTooltip({ active, payload, groupBy }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const title =
    groupBy === "week"
      ? `Week of ${formatDate(point.date, groupBy)}`
      : formatDate(point.date, groupBy);
  return (
    <div className="rounded-lg border border-(--border-color) bg-(--sidebar-active-background) px-3 py-2 text-xs text-(--text-color) shadow-xl">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">
        {SAVED_LABEL[groupBy] || "Saved"}: {formatMoney(point.savings)}
      </p>
      <p>Total so far: {formatMoney(point.cumulative)}</p>
      <p>{orderLabel(point.orders)}</p>
    </div>
  );
}

function SavingsBar(props) {
  const isLoss = props.payload.savings < 0;
  return (
    <Rectangle
      {...props}
      fill={isLoss ? "var(--error-color)" : "var(--dashboard-glow)"}
      fillOpacity={0.3}
    />
  );
}

function ChartSkeleton() {
  return (
    <div className="mt-4 animate-pulse space-y-4">
      <div className="h-7 w-32 rounded bg-(--border-color)" />
      <div className="h-40 w-full rounded-lg bg-(--border-color) sm:h-48" />
    </div>
  );
}

export default SavingChart;
