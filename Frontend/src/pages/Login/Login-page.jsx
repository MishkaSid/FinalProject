import classes from "./login.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * A login page component that renders a form with input fields for
 * username and password. The form submission event is handled by the
 * handleSubmit function, which checks if the provided username and
 * password match any of the users in the users array. If a match is
 * found, navigates to the corresponding route. Otherwise, shows an
 * alert with an error message.
 *
 * @returns {JSX.Element} A JSX element representing the login page.
 */
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const users = [
    { username: "teacher", password: "teacher" },
    { username: "admin", password: "admin" },
    { username: "user", password: "user" },
  ];

  const handleUsernameChange = (event) => setUsername(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);

  /**
   * Handles form submission event. Prevents page refresh and checks if
   * the provided username and password match any of the users in the
   * users array. If a match is found, navigates to the corresponding
   * route. Otherwise, shows an alert with an error message.
   * @param {Event} event The form submission event.
   */
  function handleSubmit(event) {
    event.preventDefault(); // Prevent page refresh

    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      if (user.username === "teacher") navigate("/teacher");
      else if (user.username === "admin") navigate("/manager");
      else if (user.username === "user") navigate("/student");
    }
    else alert("שם משתמש או סיסמה שגוי");
  }

  return (
    <div className={classes.loginPage}>
      <div className={classes.background}></div>
      <div className={classes.homepage}>
        <div className={classes.welcome}>
          <h1>נבחנים יקרים</h1>
          <p>
            ברוכים הבאים לפלטפורמת "מוכנים ובגדול"! הפלטפורמה שלנו נועדה במיוחד עבור מי ששואפים להצטרף למכללה ורוצים להתכונן בצורה הטובה ביותר למבחני הקבלה. כאן תוכלו לתרגל מתמטיקה, לשפר את הכישורים שלכם, ולבנות ביטחון לקראת האתגרים שמחכים לכם. התחילו כבר עכשיו לקחת את הצעד הראשון בדרך להגשמת השאיפות האקדמיות שלכם        </p>
        </div>
        <div className={classes.login}>
          <h1>כניסה</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="username"
              value={username}
              onChange={handleUsernameChange}
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="password"
              value={password}
              onChange={handlePasswordChange}
            />
            <button type="submit">login</button>
          </form>
          <div className={classes.warning}>
            <p>שימו לב! פלטפורמה זו הינה כלי עזר ואינה תחליף ללמידה עצמית</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
