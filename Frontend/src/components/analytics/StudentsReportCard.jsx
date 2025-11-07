import React, { useMemo, useState, useEffect } from "react";
import { getStudentsReport } from "../../services/analyticsApi";

export default function StudentsReportCard() {
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [userId, setUserId] = useState("");
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

  async function load() {
    try {
      setErr("");
      setLoading(true);
      // Convert CourseName to CourseID for API call
      const selectedCourse = courses.find(c => c.CourseName === courseName);
      const courseId = selectedCourse ? selectedCourse.CourseID : undefined;
      
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
    const bom = "\ufeff";
    const blob = new Blob([bom, csvText], { type: "text/csv;charset=utf-8" });
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
          <span>קורס</span>
          <input
            type="text"
            list="courses-list"
            value={courseName || ""}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="חפש או בחר קורס"
            required
            style={{ padding: "0.5rem", fontSize: "1.4rem", minWidth: "200px" }}
          />
          <datalist id="courses-list">
            {courses.map((course) => (
              <option key={course.CourseID} value={course.CourseName}>
                {course.CourseName}
              </option>
            ))}
          </datalist>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>חיפוש תלמיד - ת.ז או שם (אופציונלי)</span>
          <input
            type="text"
            placeholder="למשל 208082206 או שם"
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
          <table style={{ width: "100%", borderCollapse: "collapse", direction: 'rtl' }}>
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
  borderBottom: "2px solid #ddd",
  textAlign: "center",
  padding: "12px 16px",
  fontSize: "1.6rem",
  fontWeight: "600",
  backgroundColor: "#f8f9fa",
  color: "#1C3448"
};
const td = { 
  borderBottom: "1px solid #f1f1f1", 
  padding: "12px 16px",
  fontSize: "1.4rem",
  textAlign: "center"
};
