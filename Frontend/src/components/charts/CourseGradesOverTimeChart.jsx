import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { getCourseGradesOverTime } from "../../services/analyticsApi";
import styles from "./sharedChartStyles.module.css";

export default function CourseGradesOverTimeChart({ courseId, from, to }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRangeValid = useMemo(() => {
    if (!from || !to) return true;
    return new Date(from) <= new Date(to);
  }, [from, to]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!courseId) {
        setData([]);
        return;
      }
      if (!isRangeValid) return;

      setLoading(true);
      setError("");
      try {
        const res = await getCourseGradesOverTime(courseId, from, to);
        const series = Array.isArray(res?.series) ? res.series : [];
        const normalized = series.map((pt) => ({
          date: pt.date,
          avg: typeof pt.avg === "number" ? pt.avg : Number(pt.avg || 0),
        }));
        if (!ignore) setData(normalized);
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load data");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [courseId, from, to, isRangeValid]);

  return (
    <div className={styles.chartWrapper}>
      <h3 className={styles.chartTitle}>Course grades over time</h3>
      {!isRangeValid && (
        <div className={styles.error}>Invalid range: from is after to</div>
      )}
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => [`${Number(v).toFixed(1)}`, "Avg grade"]}
              />
              <Line type="monotone" dataKey="avg" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
