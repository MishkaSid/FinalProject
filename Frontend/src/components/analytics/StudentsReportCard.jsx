import React, { useMemo, useState } from "react";
import { getStudentsReport } from "../../services/analyticsApi";

export default function StudentsReportCard() {
  const [courseId, setCourseId] = useState("");
  const [userId, setUserId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const { data } = await getStudentsReport({
        courseId: courseId || undefined,
        userId: userId || undefined,
        role: "Examinee", // Only fetch Examinee (student) users
      });
      setRows(data || []);
    } catch (e) {
      setErr(e.message || "Failed");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const csvText = useMemo(() => {
    // כותרות
    const head = [
      "Student Name",
      "ID",
      "Average",
      "Last3-1",
      "Last3-2",
      "Last3-3",
    ];
    const lines = [head.join(",")];
    rows.forEach((r) => {
      const last3 = r.last3 || [];
      const line = [
        `"${r.name?.replace(/"/g, '""') || ""}"`,
        `"${r.userId || ""}"`,
        r.avgAll != null ? r.avgAll : "",
        last3[0] != null ? last3[0] : "",
        last3[1] != null ? last3[1] : "",
        last3[2] != null ? last3[2] : "",
      ].join(",");
      lines.push(line);
    });
    return lines.join("\n");
  }, [rows]);

  function downloadCSV(filename = "students-report.csv") {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>
        דוח מנהל - כל התלמידים או תלמיד ספציפי
      </h2>

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
          <span>Course ID - אופציונלי</span>
          <input
            type="text"
            placeholder="למשל 1"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>ת.ז תלמיד - אופציונלי</span>
          <input
            type="text"
            placeholder="למשל 208082206"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>

        <button onClick={load} disabled={loading}>
          טען דוח
        </button>
        <button
          onClick={() =>
            downloadCSV(
              userId ? `student-${userId}-report.csv` : "students-report.csv"
            )
          }
          disabled={!rows.length}
        >
          ייצוא CSV
        </button>
      </div>

      {loading && <div>טוען...</div>}
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      {!loading && !err && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>שם התלמיד</th>
                <th style={th}>ת.ז</th>
                <th style={th}>ממוצע כללי</th>
                <th style={th}>ציוני 3 מבחנים אחרונים</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.userId}>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.userId}</td>
                  <td style={td}>{r.avgAll != null ? r.avgAll : "-"}</td>
                  <td style={td}>
                    {r.last3 && r.last3.length
                      ? r.last3.filter((x) => x != null).join(" , ")
                      : "-"}
                  </td>
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
