import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classes from "./login.module.css";
import Popup from "../../components/popup/Popup";
import { useAuth } from "../../context/AuthContext"; // ✅ import auth hook

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const { login, user } = useAuth(); // ✅ use login() and user from context
  const navigate = useNavigate();

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

      const { token } = response.data;

      // ✅ Save token via AuthContext
      login(token);

      // ✅ Decode token locally (optional, safer to wait for context update)
      const payload = JSON.parse(atob(token.split(".")[1])); // decode payload
      const role = payload.role;

      // ✅ Navigate by role
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
      setShowPopup(true);
    }
  };

  return (
    <div className={classes.loginPage}>
      <div className={classes.background}></div>
      <div className={classes.homepage}>
        <div className={classes.logos}>
          <img className={classes.logo} src="src/assets/images/logoBeta.PNG" alt="logo" />
          <img className={classes.schoolLogo} src="https://www.pet.ac.il/images/logo.png" alt="logo" />
        </div>
        <div className={classes.welcome}>
          <p>ברוכים הבאים לפלטפורמת "מוכנים ובגדול"!... התחילו כבר עכשיו...</p>
        </div>
        <div className={classes.login}>
          <h1>כניסה</h1>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
