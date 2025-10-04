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

export default function TopicFailureRateCard() {
  const [courseId, setCourseId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const title = useMemo(() => {
    const base = "אחוז נכשלים לפי נושא";
    if (from && to) return `${base}: ${from} עד ${to}`;
    return base;
  }, [from, to]);

  async function load() {
    try {
      if (!courseId) return;
      setErr("");
      setLoading(true);
      const { items } = await getTopicFailureRates(courseId, from, to);
      // גרף: נשתמש ב-failure כאחוז
      const chartData = (items || []).map((it) => ({
        topic: it.topicName || String(it.topicId),
        failure: Number(it.failureRate || 0),
        total: Number(it.total || 0),
        failed: Number(it.failed || 0),
      }));
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
    // נטען אוטומטית אם הוזן קורס
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
          <span>Course ID</span>
          <input
            type="text"
            placeholder="למשל 1"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>

        <button onClick={load} disabled={!courseId || loading}>
          טען
        </button>
        <button
          onClick={() => {
            const now = new Date();
            const toStr = now.toISOString().slice(0, 10);
            const d30 = new Date(now);
            d30.setDate(d30.getDate() - 30);
            const fromStr = d30.toISOString().slice(0, 10);
            setFrom(fromStr);
            setTo(toStr);
          }}
        >
          30 ימים אחרונים
        </button>
        <button
          onClick={() => {
            setFrom("");
            setTo("");
          }}
        >
          נקה טווח
        </button>
      </div>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <BarChart
            data={rows}
            margin={{ top: 12, right: 16, left: 0, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" interval={0} tick={{ fontSize: 12 }} />
            <YAxis unit="%" domain={[0, 100]} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="failure" name="אחוז נכשלים" fill="#ff7675" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {loading && (
        <div style={{ textAlign: "center", paddingTop: 8 }}>טוען...</div>
      )}
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      {/* טבלה מפורטת מתחת לגרף */}
      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>נושא</th>
              <th style={th}>סך שאלות שנענו</th>
              <th style={th}>מספר נכשלו</th>
              <th style={th}>אחוז נכשלים</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.topic}>
                <td style={td}>{r.topic}</td>
                <td style={td}>{r.total}</td>
                <td style={td}>{r.failed}</td>
                <td style={td}>{r.failure}%</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td style={td} colSpan={4}>
                  (אין נתונים להצגה)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  padding: "8px",
};
const td = { borderBottom: "1px solid #f1f1f1", padding: "8px" };
