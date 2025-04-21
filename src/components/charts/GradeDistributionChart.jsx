
import React from "react";
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

const data = [
  { range: "0-10", students: 5 },
  { range: "10-20", students: 10 },
  { range: "20-30", students: 15 },
  { range: "30-40", students: 8 },
  { range: "40-50", students: 10 },
  { range: "50-60", students: 20 },
  { range: "60-70", students: 15 },
  { range: "70-80", students: 8 },
  { range: "80-90", students: 12 },
  { range: "90-100", students: 5 }
];

export default function GradeDistributionChart() {
  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.chartTitle}>התפלגות ציונים</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="students" fill="#3498db" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
