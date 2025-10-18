// Frontend/src/pages/Login/ForgotPassword.jsx
// Simple form to request password reset by email
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./passwordReset.module.css";

const API = "http://localhost:5000";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return email.includes("@") && email.includes(".");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate email format
    if (!validateEmail(email)) {
      setError("אנא הזן כתובת אימייל תקינה");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email });
      // Redirect directly to reset password page
      navigate("/reset-password");
    } catch (err) {
      console.error("forgot-password request failed:", err);
      setError("שגיאה בשליחת בקשת איפוס");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
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
              className={`${styles.input} ${styles.emailInput}`}
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
