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
      {!isRangeValid && (
        <div className={styles.errorState}>Invalid range: from is after to</div>
      )}
      {error && <div className={styles.errorState}>{error}</div>}
      {loading ? (
        <div className={styles.loadingState}>Loading...</div>
      ) : data.length === 0 ? (
        <div className={styles.emptyState}>No data available for the selected range</div>
      ) : (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#ccc' }}
                tickLine={{ stroke: '#ccc' }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#ccc' }}
                tickLine={{ stroke: '#ccc' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "white",
                  border: "none"
                }}
                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Average Grade"]}
                labelStyle={{ color: "white" }}
              />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#3498db"
                strokeWidth={3}
                dot={{ fill: '#3498db', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3498db', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
