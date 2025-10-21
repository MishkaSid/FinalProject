// Frontend/src/pages/Login/Login-page.jsx
// בקובץ זה נמצא דף ההתחברות הראשי של המערכת
// הקובץ מספק ממשק התחברות עם שדות אימייל וסיסמה
// הוא מטפל בתהליך האותנטיקציה ומנווט למשתמש לפי תפקידו
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import classes from "./login.module.css";
import Popup from "../../components/popup/Popup";
import { useAuth } from "../../context/AuthContext";

/**
 * Handles user login by sending a request to the server and storing the
 * received token in the AuthContext. The user is then navigated to the
 * appropriate page based on their role.
 */
function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setErrorMessage] = useState("Error");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles user login by sending a request to the server and storing the
   * received token in the AuthContext. The user is then navigated to the
   * appropriate page based on their role.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The login form submission event.
   * @returns {Promise<void>} - Resolves after the login request is complete.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const { token } = response.data;
      login(token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      switch (role) {
        case "Admin":
          navigate("/manager");
          break;
        case "Teacher":
          navigate("/teacher");
          break;
        case "Examinee":
          navigate("/student");
          break;
        default:
          navigate("/not-found");
      }
    } catch (error) {
      let msg = String(error?.message || e);

      if (error instanceof AxiosError) {
        msg = error.response.data.message;
      }


      setErrorMessage(msg)

      setShowPopup(true);
    }
  };

  return (
    <div className={classes.loginPage}>
      <div className={classes.background}></div>
      <div className={classes.homepage}>
        <div className={classes.logos}>
          <img
            className={classes.logo}
            src="src/assets/images/logoBeta.PNG"
            alt="logo"
          />
          <img
            className={classes.schoolLogo}
            src="https://www.pet.ac.il/images/logo.png"
            alt="logo"
          />
        </div>
        <div className={classes.login}>
          <h1>כניסה</h1>
          <form onSubmit={handleLogin}>
            <input
              className={classes.input}
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />

            <div className={classes.inputWrap}>
              <input
                id="password"
                name="password"
                className={classes.input}
                type={showPwd ? "text" : "password"}
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className={classes.eyeBtn}
                onMouseDown={(e) => e.preventDefault()} // לא לאבד פוקוס
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "הסתר סיסמה" : "הצג סיסמה"}
                title={showPwd ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showPwd ? (
                  // עין סגורה
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M4 4l16 16"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  // עין פתוחה
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button type="submit">התחבר</button>
          </form>

          <p style={{ textAlign: "center", marginTop: 8 }}>
            <a href="/forgot-password">שכחתי סיסמה</a>
          </p>

          <div className={classes.warning}>
            <p>שימו לב! פלטפורמה זו הינה כלי עזר ואינה תחליף ללמידה עצמית</p>
          </div>
        </div>
      </div>

      <Popup
        header="שגיאה בהתחברות"
        text={message}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      >
        <div className={classes.popupContent}>
          <p>שגיאה בהתחברות</p>
        </div>
      </Popup>
    </div>
  );
}

export default LoginPage;
