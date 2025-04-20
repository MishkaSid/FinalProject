
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./sharedChartStyles.module.css";

const data = [
  { name: "קל", value: 45 },
  { name: "בינוני", value: 35 },
  { name: "קשה", value: 20 },
];

const COLORS = ["#2ecc71", "#f1c40f", "#e74c3c"];

export default function QuestionDifficultyChart() {
  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.chartTitle}>דרגת קושי של שאלות</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
