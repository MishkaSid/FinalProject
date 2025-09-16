// בקובץ זה נמצא דף השגיאה עבור משתמשים ללא הרשאה
// הקובץ מציג הודעת שגיאה כאשר משתמש מנסה לגשת לדף שאין לו הרשאה אליו
// הוא מספק מידע על יצירת קשר עם מנהל המערכת במקרה של שגיאה
// Frontend/src/pages/unauthorize/Unauthorize.jsx
import styles from "./unauthorize.module.css";

/**
 * A page to be displayed when the user doesn't have the necessary permissions
 * to access the requested page.
 *
 * @returns {JSX.Element} The unauthorized page.
 * @example
 * const Unauthorize = () => {
 *   return (
 *     <div className={styles.container}>
 *       <h1 className={styles.title}> ... </h1>
 *       <p className={styles.subtitle}> ... </p>
 *       <a className={styles.email} href="mailto:harshama@pet.ac.il"> ... </a>
 *     </div>
 *   );
 * };
 */
const Unauthorize = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>אין לך הרשאה לגישה לדף זה</h1>
      <p className={styles.subtitle}>
        אם אתה מנהל או מורה, אנא פנה למנהל המערכת
      </p>
      <a className={styles.email} href="mailto:harshama@pet.ac.il">harshama@pet.ac.il</a>
    </div>
  );
};

export default Unauthorize;
