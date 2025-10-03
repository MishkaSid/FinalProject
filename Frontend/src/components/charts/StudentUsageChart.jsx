// בקובץ זה נמצא רכיב הגרף להצגת שימוש יומי במערכת
// הקובץ מציג גרף קווים עם מספר הסטודנטים שהתחברו בכל יום
// הוא מספק מידע על רמת הפעילות והשימוש בפלטפורמה
// Frontend/src/components/charts/StudentUsageChart.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./sharedChartStyles.module.css";
import { getSiteVisitsCount } from "../../services/analyticsApi";

/**
 * גרף שימוש יומי בפלטפורמה מתוך טבלת site_visit
 * Props:
 *   from (YYYY-MM-DD, אופציונלי)
 *   to   (YYYY-MM-DD, אופציונלי)
 */
export default function StudentUsageChart({ from, to }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (from && to) return `שימוש יומי בפלטפורמה: ${from} עד ${to}`;
    return "שימוש יומי בפלטפורמה";
  }, [from, to]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const { series } = await getSiteVisitsCount(from, to);
        if (!active) return;
        // המרה לפורמט של recharts
        const rows = (series || []).map((r) => ({
          date: r.date,
          users: Number(r.count || 0),
        }));
        setData(rows);
        // עזר לבדיקות: פתח קונסול ותראה את הנתונים
        // console.log("visits series:", series);
      } catch (e) {
        console.error("StudentUsageChart load error:", e);
        if (active) setData([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [from, to]);

  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.chartTitle}>{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderRadius: "2rem",
              fontSize: "1.8rem",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#1abc9c"
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {loading && (
        <div style={{ textAlign: "center", paddingTop: 8 }}>טוען...</div>
      )}
      {!loading && data.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          אין נתונים בטווח שנבחר
        </div>
      )}
    </div>
  );
}
