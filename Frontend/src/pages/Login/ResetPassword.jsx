// Frontend/src/pages/Login/ResetPassword.jsx
// Code-based password reset
import React, { useState } from "react";
import axios from "axios";
import styles from "./passwordReset.module.css";

const API = "http://localhost:5000";

export default function ResetPassword() {
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [step, setStep] = useState(2); // 2: code, 3: password, 4: done
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");


  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await axios.post(`${API}/api/auth/verify-reset-code`, { code });
      setStep(3);
    } catch (e) {
      console.error("verify code error:", e);
      setErr("קוד האימות שגוי או שפג תוקפו");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwd !== confirmPwd) {
      setErr("הסיסמאות אינן תואמות");
      return;
    }
    if (pwd.length < 6) {
      setErr("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    
    setLoading(true);
    setErr("");
    try {
      await axios.post(`${API}/api/auth/reset-password`, {
        code,
        newPassword: pwd,
      });
      setStep(4);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (e) {
      console.error("reset error:", e);
      setErr("לא ניתן לאפס סיסמה. נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            טוען...
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className={styles.container}>
        <div className={styles.background}></div>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>✅</div>
            <h1 className={styles.title}>הסיסמה אופסה בהצלחה!</h1>
            <p className={styles.subtitle}>מעביר למסך ההתחברות...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      <div className={styles.card}>
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}></div>
          <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}></div>
          <div className={`${styles.step} ${step >= 4 ? styles.active : ''}`}></div>
        </div>


        {step === 2 && (
          <div>
            <div className={styles.header}>
              <div className={styles.icon}>🔢</div>
              <h1 className={styles.title}>הזנת קוד אימות</h1>
              <p className={styles.subtitle}>הזן את קוד האימות שקיבלת במייל:</p>
            </div>
            
            <form onSubmit={handleCodeSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="קוד אימות (6 ספרות)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className={styles.codeInput}
                />
              </div>
              
              {err && <div className={styles.error}>{err}</div>}
              
              <button 
                type="submit" 
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    בודק...
                  </div>
                ) : (
                  "אמת קוד"
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => window.location.href = "/forgot-password"}
                className={styles.secondaryButton}
              >
                חזור לבקשת קוד
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className={styles.header}>
              <div className={styles.icon}>🔑</div>
              <h1 className={styles.title}>סיסמה חדשה</h1>
              <p className={styles.subtitle}>הזן סיסמה חדשה:</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="סיסמה חדשה"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="אשר סיסמה"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
              
              <div className={styles.passwordRequirements}>
                מומלץ לפחות 6 תווים
              </div>
              
              {err && <div className={styles.error}>{err}</div>}
              
              <button 
                type="submit" 
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    מאפס...
                  </div>
                ) : (
                  "אפס סיסמה"
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(2)}
                className={styles.secondaryButton}
              >
                חזור לשלב הקודם
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
