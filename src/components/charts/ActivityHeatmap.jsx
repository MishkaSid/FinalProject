
// Note: Recharts doesn't support heatmaps natively.
// This is a placeholder for a heatmap-style component using rectangles to simulate activity.

import React from "react";
import styles from "./sharedChartStyles.module.css";

const days = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const weeks = new Array(4).fill(0).map((_, weekIndex) =>
  days.map((day, dayIndex) => ({
    day,
    intensity: Math.floor(Math.random() * 4), // 0 to 3
  }))
);

const intensityColors = ["#ecf0f1", "#bdc3c7", "#95a5a6", "#34495e"];

export default function ActivityHeatmap() {
  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.chartTitle}>פעילות שבועית</h2>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        {weeks.map((week, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {week.map((cell, j) => (
              <div
                key={j}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: intensityColors[cell.intensity],
                  borderRadius: "4px",
                }}
                title={`יום ${cell.day}: פעילות ${cell.intensity}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
