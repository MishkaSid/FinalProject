
import React from "react";
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

const usageData = [
  { date: "01/04", users: 12 },
  { date: "02/04", users: 18 },
  { date: "03/04", users: 23 },
  { date: "04/04", users: 19 },
  { date: "05/04", users: 30 },
  { date: "06/04", users: 26 },
  { date: "07/04", users: 34 },
];

export default function StudentUsageChart() {
  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.chartTitle}>שימוש יומי בפלטפורמה</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={usageData} margin={{ top: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
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
    </div>
  );
}
