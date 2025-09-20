import React, { useState, useEffect } from "react";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,Legend,} from "recharts";
import styles from "./sharedChartStyles.module.css";
import { getStudentTopicAccuracy } from "../../services/analyticsApi";

const COLORS = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"];

/**
 * The QuestionStatsChart component renders a set of charts that visualize
 * student performance by topic. The component includes two main charts:
 * 
 * 1. A BarChart that displays the student's accuracy by topic. Each bar
 *    represents a different topic (e.g., "אלגברה", "גיאומטריה"),
 *    and its height corresponds to the accuracy percentage.
 * 
 * 2. A PieChart that shows the accuracy distribution across topics.
 *    Each slice of the pie represents a different topic and indicates the
 *    proportion of correct answers within that topic.
 * 
 * Both charts are wrapped in responsive containers to ensure they resize
 * appropriately based on the available space.
 */

export default function QuestionStatsChart({ userId }) {
  const [topicData, setTopicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getStudentTopicAccuracy(userId);
        
        // Transform data for the charts
        const chartData = response.items.map(item => ({
          topic: item.topic,
          accuracy: item.accuracy,
          // For pie chart, we need to calculate the "fails" (100 - accuracy)
          fails: 100 - item.accuracy
        }));
        
        setTopicData(chartData);
      } catch (err) {
        console.error('Failed to fetch topic accuracy:', err);
        setError(err.message || 'Failed to load topic accuracy data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <>
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>דיוק לפי נושא</h2>
          <div className={styles.loadingState}>טוען נתונים...</div>
        </div>
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>התפלגות דיוק לפי נושא</h2>
          <div className={styles.loadingState}>טוען נתונים...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>דיוק לפי נושא</h2>
          <div className={styles.errorState}>שגיאה בטעינת נתונים: {error}</div>
        </div>
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>התפלגות דיוק לפי נושא</h2>
          <div className={styles.errorState}>שגיאה בטעינת נתונים: {error}</div>
        </div>
      </>
    );
  }

  if (topicData.length === 0) {
    return (
      <>
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>דיוק לפי נושא</h2>
          <div className={styles.emptyState}>אין נתוני דיוק זמינים</div>
        </div>
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>התפלגות דיוק לפי נושא</h2>
          <div className={styles.emptyState}>אין נתוני דיוק זמינים</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>דיוק לפי נושא</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topicData} margin={{ top: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" />
            <YAxis domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor:" rgba(0, 0, 0, 0.8)", borderRadius: "2rem", fontSize: "1.8rem" }}/>
            <Bar dataKey="accuracy" fill="#3498db" radius={[6, 6, 0, 0]} name="דיוק (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>התפלגות דיוק לפי נושא</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={topicData}
              dataKey="accuracy"
              nameKey="topic"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ topic, accuracy }) =>
                `${topic} - ${accuracy.toFixed(1)}%`
              }
            >
              {topicData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor:" rgba(255, 255, 255, 0.8)", borderRadius: "2rem", fontSize: "1.8rem" }}/>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
