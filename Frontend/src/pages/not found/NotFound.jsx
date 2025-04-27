import styles from "./notFound.module.css";

const NotFound = () => {
  return (
    <>
    <div className={styles.background}/>
      <div className={styles.container}>
        <h1 className={styles.title}>ERROR 404</h1>
        <p className={styles.message}>Page Not Found</p>
      </div>
    </>
  );
};

export default NotFound;
