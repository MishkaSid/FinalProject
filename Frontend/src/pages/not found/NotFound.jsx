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
