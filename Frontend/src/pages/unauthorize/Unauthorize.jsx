import styles from "./unauthorize.module.css";

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
