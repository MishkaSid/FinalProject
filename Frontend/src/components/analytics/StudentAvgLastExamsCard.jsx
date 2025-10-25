import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { getStudentAvgLastExams } from "../../services/analyticsApi";
import { useAuth } from "../../context/AuthContext";

export default function StudentAvgLastExamsCard() {
  const { logout, isTokenValid } = useAuth();
  const [userId, setUserId] = useState("");
  const [limit, setLimit] = useState(3);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      setLoading(true);
      
      // Check if token is valid before making the request
      if (!isTokenValid()) {
        setErr("הטוקן שלך פג תוקף. אנא התחבר מחדש.");
        logout();
        setData(null);
        return;
      }
      
      const res = await getStudentAvgLastExams(userId, limit);
      // הכנה לגרף: ממפים לנתונים עם שדות אחידים
      const chartData = (res.exams || [])
        .map((x, idx) => ({
          key: `${x.date} #${x.examId}`,
          date: x.date,
          score: Number(x.score || 0),
          index: res.exams.length - idx, // 1 הוא הישן ביותר בצד שמאל
        }))
        .reverse(); // כך שהישן יופיע שמאלית והאחרון מימין
      setData({ ...res, chartData });
    } catch (e) {
      console.error(e);
      
      // Handle authentication errors
      if (e.message && (e.message.includes("403") || e.message.includes("Invalid or expired token"))) {
        setErr("הטוקן שלך פג תוקף או אינו תקין. אנא התחבר מחדש.");
        logout();
      } else {
        setErr(e.message || "שגיאה בטעינת הנתונים");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>ממוצע N מבחנים אחרונים לנבחן</h2>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>ת.ז</span>
          <input
            type="text"
            placeholder="לדוגמה 208082206"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>N מבחנים אחרונים</span>
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value || 1))}
          />
        </label>

        <button onClick={load} disabled={!userId || loading}>
          חשב
        </button>
      </div>

      {loading && <div style={{ marginTop: 12 }}>טוען...</div>}
      {err && (
        <div style={{ 
          marginTop: 12, 
          padding: "12px 16px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          color: "#856404"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>⚠️ שגיאה</div>
          <div>{err}</div>
          {err.includes("התחבר מחדש") && (
            <div style={{ marginTop: "8px" }}>
              <a 
                href="/login" 
                style={{ 
                  color: "#F47521", 
                  textDecoration: "underline",
                  fontWeight: "bold"
                }}
              >
                לחץ כאן להתחברות מחדש
              </a>
            </div>
          )}
        </div>
      )}

      {data && (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            ממוצע: <b>{data.average}</b> מתוך {data.limit} מבחנים
          </div>

          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart
                data={data.chartData}
                margin={{ top: 12, right: 16, left: 0, bottom: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={0} />
                <YAxis allowDecimals={false} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <ReferenceLine
                  y={data.average}
                  stroke="rgba(231, 76, 60, 0.9)"
                  strokeDasharray="4 4"
                  label={{
                    value: `avg ${data.average}`,
                    position: "insideTopRight",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="score"
                  name="ציון מבחן"
                  fill="#3db6ff"
                  stroke="#2aa7df"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
