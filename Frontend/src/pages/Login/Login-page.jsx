import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classes from "./login.module.css";
import Popup from "../../components/popup/Popup";

/**
 * A login page component that handles user authentication.
 *
 * ************  IN PROGRESS   ****************
 * 
 * @returns {JSX.Element} A JSX element representing the login page.
 */

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  /**
   * Handles login form submission. Sends a request to the authentication
   * API endpoint and processes the response.
   * @param {Event} e The form submission event.
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      // Save token & user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || "שגיאה בהתחברות";
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
        <div className={classes.welcome}>
          <p>
            ברוכים הבאים לפלטפורמת "מוכנים ובגדול"! הפלטפורמה שלנו נועדה במיוחד
            עבור מי ששואפים להצטרף למכללה ורוצים להתכונן בצורה הטובה ביותר
            למבחני הקבלה. כאן תוכלו לתרגל מתמטיקה, לשפר את הכישורים שלכם, ולבנות
            ביטחון לקראת האתגרים שמחכים לכם. התחילו כבר עכשיו לקחת את הצעד
            הראשון בדרך להגשמת השאיפות האקדמיות שלכם
          </p>
        </div>
        <div className={classes.login}>
          <h1>כניסה</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">התחבר</button>
          </form>
          <div className={classes.warning}>
            <p>שימו לב! פלטפורמה זו הינה כלי עזר ואינה תחליף ללמידה עצמית</p>
          </div>
        </div>
      </div>
        <Popup header="שגיאה בהתחברות" text="שם המשתמש ו/או הסיסמה שגוים" isOpen={showPopup} onClose={() => setShowPopup(false)}>
          <div className={classes.popupContent}>
            <p>שגיאה בהתחברות</p>
          </div>
        </Popup>
    </div>
  );
}

export default LoginPage;

