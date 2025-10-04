// Frontend/src/pages/Login/ForgotPassword.jsx
// Simple form to request password reset by email
import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      console.error("forgot-password request failed:", err);
      setError("שגיאה בשליחת בקשת איפוס");
      setSent(false);
    }
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 420, margin: "40px auto" }}>
        <h2>איפוס סיסמה</h2>
        <p>אם הכתובת קיימת, נשלח מייל עם קישור לאיפוס.</p>
        <a href="/">חזרה למסך ההתחברות</a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>איפוס סיסמה</h2>
      <input
        type="email"
        placeholder="אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: "100%", padding: 10, marginTop: 8 }}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button
        type="submit"
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      >
        שלח קישור לאיפוס
      </button>
    </form>
  );
}
