import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getTopicFailureRates } from "../../services/analyticsApi";
import { getLast30DaysRange } from "../../utils/dateUtils";
import styles from "../../pages/manager/home/manager.module.css";

export default function TopicFailureRateCard() {
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/courses/getCourses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        const coursesList = Array.isArray(data) ? data : [];
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const title = useMemo(() => {
    const base = "";
    if (from && to) return `${base}: ${from} עד ${to}`;
    return base;
  }, [from, to]);

  const handleLast30Days = () => {
    const { from: fromDate, to: toDate } = getLast30DaysRange();
    setFrom(fromDate);
    setTo(toDate);
  };

  const handleClearDates = () => {
    setFrom("");
    setTo("");
  };

  async function load() {
    try {
      if (!courseName) {
        setRows([]);
        return;
      }
      setErr("");
      setLoading(true);
      // Convert CourseName to CourseID for API call
      const selectedCourse = courses.find(c => c.CourseName === courseName);
      if (!selectedCourse) {
        setErr("קורס לא נמצא");
        setRows([]);
        return;
      }
      const { items } = await getTopicFailureRates(selectedCourse.CourseID, from, to);
      
      // Sort by number of wrong answers (ascending order)
      const chartData = (items || [])
        .map((it) => ({
          topic: it.topicName || String(it.topicId),
          failure: Number(it.failureRate || 0),
          total: Number(it.total || 0),
          failed: Number(it.failed || 0),
        }))
        .sort((a, b) => a.failed - b.failed); // Sort by failed count ascending
      
      setRows(chartData);
    } catch (e) {
      console.error("TopicFailureRate load error:", e);
      setErr(e.message || "Failed");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-load when courseName is selected
    if (courseName) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseName, from, to]);

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>{title}</h2>

      <div className={styles.cardControls}>
        <div className={styles.controlRow}>
          <label className={styles.controlLabel}>קורס</label>
          <input
            type="text"
            list="courses-list-topic"
            className={styles.controlInput}
            value={courseName || ""}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="חפש או בחר קורס"
            required
            style={{ maxWidth: '200px' }}
          />
          <datalist id="courses-list-topic">
            {courses.map((course) => (
              <option key={course.CourseID} value={course.CourseName}>
                {course.CourseName}
              </option>
            ))}
          </datalist>
          <label className={styles.controlLabel}>מתאריך</label>
          <input
            type="date"
            className={styles.controlInput}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <label className={styles.controlLabel}>עד תאריך</label>
          <input
            type="date"
            className={styles.controlInput}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <div className={styles.buttonRow} style={{ marginTop: 0, marginRight: 'auto' }}>
            <button
              className={styles.smallButton}
              onClick={load}
              disabled={!courseName || loading}
              style={{ 
                backgroundColor: courseName ? "var(--admin-accent)" : "#bdc3c7",
                cursor: courseName ? "pointer" : "not-allowed"
              }}
            >
              {loading ? "טוען..." : "טען"}
            </button>
            <button
              className={styles.smallButton}
              onClick={handleLast30Days}
            >
              30 יום אחרונים
            </button>
            <button
              className={`${styles.smallButton} ${styles.secondary}`}
              onClick={handleClearDates}
            >
              נקה
            </button>
          </div>
        </div>
      </div>

      {!courseName && (
        <div style={{ 
          background: "#fff3cd", 
          border: "1px solid #ffeaa7", 
          borderRadius: "4px", 
          padding: "12px", 
          marginBottom: "12px",
          color: "#856404"
        }}>
          ⚠️ יש לבחור קורס כדי להציג נתונים
        </div>
      )}

      {courseName && (
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer>
            <BarChart
              data={rows}
              margin={{ top: 12, right: 16, left: 0, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="topic" 
                interval={0} 
                tick={{ fontSize: 12 }} 
              />
              <YAxis 
                label={{ value: 'מספר תשובות שגויות', angle: -90, position: 'insideLeft' }}
                domain={[0, 'dataMax']} 
                allowDecimals={false} 
              />
              <Tooltip 
                formatter={(value, name) => [value, 'תשובות שגויות']}
                labelFormatter={(label) => `נושא: ${label}`}
              />
              <Legend />
              <Bar dataKey="failed" name="תשובות שגויות" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", paddingTop: 8 }}>טוען...</div>
      )}
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      {/* טבלה מפורטת מתחת לגרף */}
      {courseName && (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <h3 style={{ marginBottom: 8, color: "#333" }}>פירוט לפי נושא (מסודר לפי מספר שגיאות)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={th}>נושא</th>
                <th style={th}>סך שאלות שנענו</th>
                <th style={th}>מספר תשובות שגויות</th>
                <th style={th}>אחוז שגיאות</th>
                <th style={th}>אחוז הצלחה</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => (
                <tr key={r.topic} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                  <td style={td}>{r.topic}</td>
                  <td style={td}>{r.total}</td>
                  <td style={{...td, color: r.failed > 0 ? "#e74c3c" : "#27ae60", fontWeight: "bold"}}>
                    {r.failed}
                  </td>
                  <td style={{...td, color: r.failure > 50 ? "#e74c3c" : r.failure > 25 ? "#f39c12" : "#27ae60"}}>
                    {r.failure}%
                  </td>
                  <td style={{...td, color: (100 - r.failure) > 75 ? "#27ae60" : (100 - r.failure) > 50 ? "#f39c12" : "#e74c3c"}}>
                    {(100 - r.failure).toFixed(1)}%
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td style={{...td, textAlign: "center", color: "#7f8c8d"}} colSpan={5}>
                    אין נתונים להצגה עבור הקורס הנבחר
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
const th = {
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  padding: "8px",
};
const td = { borderBottom: "1px solid #f1f1f1", padding: "8px" };

