import React from "react";
import styles from "./card.module.css";

export default function Card({ title, description, icon, onClick, size = "medium", layout = "vertical" }) {
  return (
    <div
      className={`${styles.card} ${styles[size]} ${layout === "horizontal" ? styles.horizontal : ""}`}
      onClick={onClick}
    >
      {icon && <div className={styles.cardIcon}>{icon}</div>}
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </div>
  );
}
