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
            <Tooltip />
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
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
