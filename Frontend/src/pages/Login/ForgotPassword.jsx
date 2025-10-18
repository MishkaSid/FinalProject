// Frontend/src/pages/Login/ForgotPassword.jsx
// Simple form to request password reset by email
import React, { useState } from "react";
import axios from "axios";
import styles from "./passwordReset.module.css";

const API = "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      console.error("forgot-password request failed:", err);
      setError("שגיאה בשליחת בקשת איפוס");
      setSent(false);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>📧</div>
            <h1 className={styles.title}>קוד נשלח בהצלחה!</h1>
            <p className={styles.subtitle}>
              אם הכתובת קיימת, נשלח מייל עם קוד אימות לכתובת:
            </p>
            <div className={styles.emailDisplay}>{email}</div>
          </div>
          
          <div className={styles.form}>
            <a href="/reset-password" className={styles.linkButton}>
              להזנת קוד האימות
            </a>
            <a href="/" className={styles.backLink}>
              חזרה למסך ההתחברות
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>🔐</div>
          <h1 className={styles.title}>איפוס סיסמה</h1>
          <p className={styles.subtitle}>
            הזן את כתובת האימייל שלך ונשלח לך קוד אימות לאיפוס הסיסמה
          </p>
        </div>
        
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="כתובת אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                שולח...
              </div>
            ) : (
              "שלח קוד אימות"
            )}
          </button>
          
          <a href="/" className={styles.backLink}>
            חזרה למסך ההתחברות
          </a>
        </form>
      </div>
    </div>
  );
}
