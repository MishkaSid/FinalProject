
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
  { range: "90-100", students: 6 },
  { range: "80-89", students: 10 },
  { range: "70-79", students: 5 },
  { range: "<70", students: 3 },
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
