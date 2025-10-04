// בקובץ זה נמצא רכיב הגרף להצגת התפלגות ציונים במערכת
// הקובץ מציג גרף עמודות עם התפלגות ציונים של סטודנטים לפי טווחים
// הוא משמש להצגת נתונים סטטיסטיים על ביצועי הסטודנטים במערכת
// Frontend/src/components/charts/GradeDistributionChart.jsx
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
 * The chart is rendered with a tooltip that displays the range of grades and
 * the number of students who scored within that range when the user hovers over
 * the bar.
 */
export default function GradeDistributionChart() {
  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="range" 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
              tickLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
              tickLine={{ stroke: '#ccc' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "rgba(0, 0, 0, 0.8)", 
                borderRadius: "8px", 
                fontSize: "14px",
                color: "white",
                border: "none"
              }}
              labelStyle={{ color: "white" }}
            />
            <Bar 
              dataKey="students" 
              fill="#3498db" 
              radius={[4, 4, 0, 0]}
              stroke="#2980b9"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
