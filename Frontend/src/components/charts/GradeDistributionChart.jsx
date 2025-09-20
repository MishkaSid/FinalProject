
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import styles from "./sharedChartStyles.module.css";
import { getExamCounters } from "../../services/analyticsApi";

/**
 * The GradeDistributionChart component renders a bar chart that displays the
 * student's exam performance summary and statistics.
 *
 * The chart is rendered inside a div with the class "chartWrapper", and the
 * chart title is rendered as a heading element with the class "chartTitle".
 *
 * The chart displays key performance indicators including total exams taken,
 * average grade, best grade, and latest exam date.
 *
 * The chart is responsive, meaning it will resize to fit the available space.
 */
export default function GradeDistributionChart({ userId }) {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getExamCounters(userId, 30); // Last 30 days
        setExamData(response);
      } catch (err) {
        console.error('Failed to fetch exam counters:', err);
        setError(err.message || 'Failed to load exam data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>סיכום מבחנים</h2>
        <div className={styles.loadingState}>טוען נתונים...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>סיכום מבחנים</h2>
        <div className={styles.errorState}>שגיאה בטעינת נתונים: {error}</div>
      </div>
    );
  }

  if (!examData || examData.totalExams === 0) {
    return (
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>סיכום מבחנים</h2>
        <div className={styles.emptyState}>אין מבחנים זמינים</div>
      </div>
    );
  }

  // Create summary data for display
  const summaryData = [
    { metric: "סה״כ מבחנים", value: examData.totalExams, color: "#3498db" },
    { metric: "ציון ממוצע", value: examData.avgGrade.toFixed(1), color: "#2ecc71" },
    { metric: "ציון גבוה ביותר", value: examData.bestGrade, color: "#f39c12" },
    { metric: "מבחן אחרון", value: examData.latestExamDate ? new Date(examData.latestExamDate).toLocaleDateString('he-IL') : "אין", color: "#e74c3c" }
  ];

  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.chartTitle}>סיכום מבחנים</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '1rem', 
        padding: '1rem',
        height: 'calc(100% - 60px)' // Account for title height
      }}>
        {summaryData.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: item.color,
              color: 'white',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {item.metric}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
