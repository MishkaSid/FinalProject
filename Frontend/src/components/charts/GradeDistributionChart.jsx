// בקובץ זה נמצא רכיב הגרף להצגת התפלגות ציונים במערכת
// הקובץ מציג גרף עמודות עם התפלגות ציונים של סטודנטים לפי טווחים
// הוא משמש להצגת נתונים סטטיסטיים על ביצועי הסטודנטים במערכת
// Frontend/src/components/charts/GradeDistributionChart.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import styles from "./sharedChartStyles.module.css";


/**
 * The GradeDistributionChart component renders a bar chart that displays the
 * distribution of student grades grouped into ranges.
 *
 * The chart fetches real data from the database using the Grade column from the Exam table.
 * It accepts date range props and shows how many exam results fall into
 * each grade range (0-10, 10-20, 20-30, etc.).
 */
export default function GradeDistributionChart({ from, to }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });

  // Fetch grade distribution data
  const fetchGradeDistribution = async (from, to) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      
      const response = await fetch(`/api/analytics/grade-distribution?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch grade distribution data');
      }

      const result = await response.json();
      setData(result.distribution || []);
      setDateRange({
        from: result.from,
        to: result.to
      });
    } catch (err) {
      console.error('Error fetching grade distribution:', err);
      setError(err.message);
      // Fallback to empty data
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or when date props change
  useEffect(() => {
    fetchGradeDistribution(from, to);
  }, [from, to]);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContainer}>
        {/* Chart Title and Date Range */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '0 10px'
        }}>
          <h3 className={styles.chartTitle} style={{ margin: 0 }}>
            התפלגות ציונים
          </h3>
          {dateRange.from && dateRange.to && (
            <p style={{ 
              fontSize: '12px', 
              color: '#666', 
              margin: '5px 0 0 0' 
            }}>
              {dateRange.from} - {dateRange.to}
            </p>
          )}
        </div>

        {/* Chart Content */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            fontSize: '16px',
            color: '#666'
          }}>
            טוען נתונים...
          </div>
        ) : error ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            fontSize: '16px',
            color: '#e74c3c'
          }}>
            שגיאה בטעינת הנתונים: {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#ccc' }}
                tickLine={{ stroke: '#ccc' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
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
                formatter={(value, name) => [value, 'מספר מבחנים']}
                labelFormatter={(label) => `טווח ציונים: ${label}`}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="rect"
                wrapperStyle={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#495057'
                }}
                formatter={(value) => 'מספר מבחנים'}
              />
              <Bar 
                dataKey="students" 
                fill="#3498db" 
                radius={[4, 4, 0, 0]}
                stroke="#2980b9"
                strokeWidth={1}
                name="מספר מבחנים"
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Grade Range Labels */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '14px', 
            color: '#495057',
            textAlign: 'center'
          }}>
            טווחי ציונים
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'].map(range => (
              <span
                key={range}
                style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {range}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
