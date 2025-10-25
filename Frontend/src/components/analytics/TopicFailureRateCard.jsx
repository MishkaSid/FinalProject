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

export default function TopicFailureRateCard() {
  const [courseId, setCourseId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const title = useMemo(() => {
    const base = "ניתוח שגיאות לפי נושא";
    if (from && to) return `${base}: ${from} עד ${to}`;
    return base;
  }, [from, to]);

  async function load() {
    try {
      if (!courseId) {
        setRows([]);
        return;
      }
      setErr("");
      setLoading(true);
      const { items } = await getTopicFailureRates(courseId, from, to);
      
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
    // Auto-load when courseId is selected
    if (courseId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, from, to]);

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>{title}</h2>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: "bold", color: courseId ? "#333" : "#e74c3c" }}>
            Course ID *
          </span>
          <input
            type="text"
            placeholder="הזן מזהה קורס"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            style={{
              border: courseId ? "1px solid #ddd" : "2px solid #e74c3c",
              borderRadius: "4px",
              padding: "8px",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>מתאריך</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "8px" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>עד תאריך</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "8px" }}
          />
        </label>

        <button
          onClick={load}
          disabled={!courseId || loading}
          style={{
            padding: "8px 16px",
            backgroundColor: courseId ? "#3498db" : "#bdc3c7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: courseId ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "טוען..." : "טען"}
        </button>
        <button
          onClick={() => {
            const { from: fromDate, to: toDate } = getLast30DaysRange();
            setFrom(fromDate);
            setTo(toDate);
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          30 ימים אחרונים
        </button>
        <button
          onClick={() => {
            setFrom("");
            setTo("");
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          נקה טווח
        </button>
      </div>

      {!courseId && (
        <div style={{ 
          background: "#fff3cd", 
          border: "1px solid #ffeaa7", 
          borderRadius: "4px", 
          padding: "12px", 
          marginBottom: "12px",
          color: "#856404"
        }}>
          ⚠️ יש לבחור מזהה קורס כדי להציג נתונים
        </div>
      )}

      {courseId && (
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer>
            <BarChart
              data={rows}
              margin={{ top: 12, right: 16, left: 0, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="topic" 
                interval={0} 
                tick={{ fontSize: 12 }} 
                angle={-45}
                textAnchor="end"
                height={80}
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
      {courseId && (
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

