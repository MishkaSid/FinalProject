// בקובץ זה נמצא רכיב הגרפים להצגת סטטיסטיקות שאלות במערכת
// הקובץ מציג גרף עמודות לסוגי שאלות וגרף עוגה לאחוז נכשלים לפי מקצוע
// הוא מספק מידע ויזואלי על ביצועי המערכת והתוכן הלימודי
// Frontend/src/components/charts/QuestionStatsChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import styles from "./sharedChartStyles.module.css";

const questionTypes = [
  { type: "אלגברה", count: 25 },
  { type: "גיאומטריה", count: 60 },
  { type: "שברים", count: 40 },
  { type: "בעיות מילוליות", count: 30 },
];

const difficultyStats = [
  { subject: "אלגברה", fails: 18 },
  { subject: "גיאומטריה", fails: 12 },
  { subject: "שברים", fails: 6 },
  { subject: "בעיות מילוליות", fails: 9 },
];

const COLORS = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"];

/**
 * The QuestionStatsChart component renders a set of charts that visualize
 * question statistics in the system. The component includes two main charts:
 *
 * 1. A BarChart that displays the number of questions by type. Each bar
 *    represents a different type of question (e.g., "אלגברה", "גיאומטריה"),
 *    and its height corresponds to the count of questions of that type.
 *
 * 2. A PieChart that shows the percentage of failed questions by subject.
 *    Each slice of the pie represents a different subject and indicates the
 *    proportion of failed questions within that subject.
 *
 * Both charts are wrapped in responsive containers to ensure they resize
 * appropriately based on the available space.
 */
export default function QuestionStatsChart() {
  return (
    <>
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>סוגי שאלות במערכת</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={questionTypes} margin={{ top: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: " rgba(0, 0, 0, 0.8)",
                borderRadius: "2rem",
                fontSize: "1.8rem",
              }}
            />
            <Bar dataKey="count" fill="#3498db" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>אחוז נכשלים לפי מקצוע</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={difficultyStats}
              dataKey="fails"
              nameKey="subject"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ subject, percent }) =>
                `${subject} - ${(percent * 100).toFixed(0)}%`
              }
            >
              {difficultyStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: " rgba(255, 255, 255, 0.8)",
                borderRadius: "2rem",
                fontSize: "1.8rem",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
