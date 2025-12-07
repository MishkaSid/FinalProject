import React, { useState, useEffect } from "react";
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
  const [examinees, setExaminees] = useState([]);
  const [examineesLoading, setExamineesLoading] = useState(false);

  // Fetch all examinees on component mount
  useEffect(() => {
    const fetchExaminees = async () => {
      try {
        setExamineesLoading(true);
        const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${API_BASE}/api/general/examinees`);
        if (!response.ok) {
          throw new Error('Failed to fetch examinees');
        }
        const data = await response.json();
        // Handle both array formats: rows directly or [rows]
        const examineesList = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];
        setExaminees(examineesList);
      } catch (error) {
        console.error("Error fetching examinees:", error);
        setExaminees([]);
      } finally {
        setExamineesLoading(false);
      }
    };

    fetchExaminees();
  }, []);

  async function load() {
    try {
      setErr("");
      setLoading(true);
      setData(null);

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

      // Handle user not found error
      if (e.userNotFound || (e.status === 404 && e.message.includes("ת.ז"))) {
        setErr("ת.ז שהוזנה לא נמצאת במערכת.");
        setData(null);
      }
      // Handle authentication errors
      else if (
        e.message &&
        (e.message.includes("403") ||
          e.message.includes("Invalid or expired token"))
      ) {
        setErr("הטוקן שלך פג תוקף או אינו תקין. אנא התחבר מחדש.");
        logout();
        setData(null);
      } else {
        setErr(e.message || "שגיאה בטעינת הנתונים");
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleExamineeSelect = (e) => {
    const selectedUserId = e.target.value;
    if (selectedUserId) {
      setUserId(selectedUserId);
    } else {
      setUserId("");
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      {/*<h2 style={{ marginBottom: 12 }}>ממוצע ציונים לפי מספר מבחנים אחרונים</h2>*/}

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "1.6rem", fontWeight: "600" }}>ת.ז</span>
          <input
            type="text"
            placeholder="לדוגמה 999999999"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ fontSize: "1.4rem", padding: "0.75rem" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "1.6rem", fontWeight: "600" }}>בחר מתוך רשימה</span>
          <select
            value={userId || ""}
            onChange={handleExamineeSelect}
            style={{ fontSize: "1.4rem", padding: "0.75rem", minWidth: "200px" }}
          >
            <option value="">-- בחר נבחן --</option>
            {examinees.map((examinee) => (
              <option key={examinee.UserID} value={examinee.UserID}>
                {examinee.Name} — {examinee.UserID}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "1.6rem", fontWeight: "600" }}>
            מספר מבחנים אחרונים
          </span>
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value || 1))}
            style={{ fontSize: "1.4rem", padding: "0.75rem" }}
          />
        </label>

        <button
          onClick={load}
          disabled={!userId || loading}
          style={{
            fontSize: "1.6rem",
            padding: "0.75rem 1.5rem",
            height: "fit-content",
          }}
        >
          חשב
        </button>

                 {data && (
           <div
             style={{
               marginRight: "2rem",
               display: "flex",
               alignItems: "center",
               gap: "12px",
               fontSize: "1.6rem",
             }}
           >
             <span>ממוצע:</span>
            <span>מספר המבחנים שהנבחן ביצע הוא: </span>
             {data.totalExams !== undefined && (
               <span>{data.totalExams}</span>
             )}
             <span>הממוצע הוא: </span>
             <b style={{ fontSize: "1.6rem", color: "#194973" }}>
               {data.average}
             </b>
             <span>מתוך {data.limit} מבחנים</span>
           </div>
         )}
      </div>
      {loading && <div style={{ marginTop: 12 }}>טוען...</div>}
      {err && (
        <div
          style={{
            marginTop: 12,
            padding: "16px 20px",
            backgroundColor: err.includes("ת.ז שהוזנה") ? "#f8d7da" : "#fff3cd",
            border: `2px solid ${err.includes("ת.ז שהוזנה") ? "#dc3545" : "#ffc107"}`,
            borderRadius: "8px",
            color: err.includes("ת.ז שהוזנה") ? "#721c24" : "#856404",
            fontSize: "1.8rem",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: err.includes("התחבר מחדש") ? "8px" : "0" }}>
            {err.includes("ת.ז שהוזנה") ? "⚠️" : "⚠️ שגיאה"}
          </div>
          <div>{err}</div>
          {err.includes("התחבר מחדש") && (
            <div style={{ marginTop: "8px" }}>
              <a
                href="/login"
                style={{
                  color: "#F47521",
                  textDecoration: "underline",
                  fontWeight: "bold",
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
