// בקובץ זה נמצא דף השגיאה 404 של המערכת
// הקובץ מציג הודעת שגיאה כאשר המשתמש מנסה לגשת לדף לא קיים
// הוא מספק חוויית משתמש טובה גם במקרה של שגיאות ניווט
// Frontend/src/pages/not found/NotFound.jsx
import styles from "./notFound.module.css";

/**
 * A NotFound component that displays a 404 error page.
 *
 * This component is shown when an invalid route is entered.
 *
 * @returns {JSX.Element} The rendered NotFound component.
 */
const NotFound = () => {
  return (
    <>
      <div className={styles.background} />
      <div className={styles.container}>
        <h1 className={styles.title}>ERROR 404</h1>
        <p className={styles.message}>Page Not Found</p>
      </div>
    </>
  );
};

export default NotFound;
