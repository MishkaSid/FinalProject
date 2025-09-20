
import React, { useState, useEffect } from "react";
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
import { getStudentGrades } from "../../services/analyticsApi";

/**
 * The StudentUsageChart component renders a line chart that displays the
 * student's grades over time for exam performance tracking.
 *
 * The chart is rendered inside a div with the class "chartWrapper", and the
 * chart title is rendered as a heading element with the class "chartTitle".
 *
 * The chart is a line chart, with the x-axis displaying the date and the
 * y-axis displaying the average grade.
 *
 * The chart is responsive, meaning it will resize to fit the available space.
 *
 * The chart has a tooltip that displays the date and the average grade
 * when the user hovers over the line.
 */
export default function StudentUsageChart({ userId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Default to last 30 days
        const to = new Date().toISOString().split('T')[0];
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const response = await getStudentGrades(userId, from, to);
        
        // Transform data for the chart
        const chartData = response.series.map(item => ({
          date: new Date(item.date).toLocaleDateString('he-IL', { month: '2-digit', day: '2-digit' }),
          grade: item.avg
        }));
        
        setData(chartData);
      } catch (err) {
        console.error('Failed to fetch student grades:', err);
        setError(err.message || 'Failed to load grades data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>ביצועי מבחנים לאורך זמן</h2>
        <div className={styles.loadingState}>טוען נתונים...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>ביצועי מבחנים לאורך זמן</h2>
        <div className={styles.errorState}>שגיאה בטעינת נתונים: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>ביצועי מבחנים לאורך זמן</h2>
        <div className={styles.emptyState}>אין נתוני מבחנים זמינים</div>
      </div>
    );
  }

  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.chartTitle}>ביצועי מבחנים לאורך זמן</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} domain={[0, 100]} />
          <Tooltip contentStyle={{ backgroundColor:" rgba(0, 0, 0, 0.8)", borderRadius: "2rem", fontSize: "1.8rem" }}/>
          <Legend />
          <Line
            type="monotone"
            dataKey="grade"
            stroke="#1abc9c"
            strokeWidth={3}
            activeDot={{ r: 6 }}
            name="ציון ממוצע"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
