// Frontend/src/pages/Login/ResetPassword.jsx
// Validate token and set a new password
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const uid = params.get("uid");

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [pwd, setPwd] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        await axios.get(`${API}/api/auth/reset-password/validate`, {
          params: { token, uid },
        });
        setValid(true);
      } catch (e) {
        console.error("validate error:", e);
        setErr("הקישור אינו תקין או שפג תוקפו");
      } finally {
        setLoading(false);
      }
    };

    if (!token || !uid) {
      setErr("קישור חסר פרטים");
      setLoading(false);
      return;
    }
    run();
  }, [token, uid]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await axios.post(`${API}/api/auth/reset-password`, {
        token,
        uid,
        newPassword: pwd,
      });
      setDone(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (e) {
      console.error("reset error:", e);
      setErr("לא ניתן לאפס סיסמה. נסה שוב");
    }
  };

  if (loading) {
    return <div style={{ maxWidth: 420, margin: "40px auto" }}>טוען...</div>;
  }

  if (!valid) {
    return (
      <div style={{ maxWidth: 420, margin: "40px auto", color: "red" }}>
        {err}
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ maxWidth: 420, margin: "40px auto" }}>
        הסיסמה אופסה. מעביר להתחברות...
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>קביעת סיסמה חדשה</h2>
      <input
        type="password"
        placeholder="סיסמה חדשה"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        required
        style={{ width: "100%", padding: 10, marginTop: 8 }}
      />
      <p style={{ fontSize: 12, color: "#666" }}>
        מומלץ לפחות 8 תווים, ספרה ואות גדולה.
      </p>
      {err && <div style={{ color: "red" }}>{err}</div>}
      <button
        type="submit"
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      >
        אפס סיסמה
      </button>
    </form>
  );
}
