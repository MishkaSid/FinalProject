
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
  { range: "70-80", students: 25 },
  { range: "80-90", students: 19 },
  { range: "90-100", students: 5 }
];

/**
 * The GradeDistributionChart component renders a bar chart that displays the
 * distribution of student grades on a given assignment.
 *
 * The chart is rendered inside a div with the class "chartWrapper", and the
 * chart title is rendered as a heading element with the class "chartTitle".
 *
 * The chart is a bar chart, with the x-axis displaying the range of grades
 * (e.g. "0-10", "10-20", etc.), and the y-axis displaying the number of
 * students who scored within each range.
 *
 * The chart is responsive, meaning it will resize to fit the available space.
 *
 * The chart is rendered with a tooltip that displays the range of grades and
 * the number of students who scored within that range when the user hovers over
 * the bar.
 */
export default function GradeDistributionChart() {
  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.chartTitle}>התפלגות ציונים</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis allowDecimals={false} />
          <Tooltip contentStyle={{ backgroundColor:" rgba(0, 0, 0, 0.8)", borderRadius: "2rem", fontSize: "1.8rem" }}/>
          <Bar dataKey="students" fill="#3598db" radius={[25, 25, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
