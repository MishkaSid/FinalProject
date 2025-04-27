import React from "react";
import styles from "./card.module.css";

/**
 * A clickable card component. Can be customized with a title, description, icon, size, and layout.
 *
 * @param {Object} props Component props.
 * @prop {String} title The card title.
 * @prop {String} [description] The card description.
 * @prop {ReactNode} [icon] A React component to display as the card icon.
 * @prop {Function} [onClick] A callback function to call when the card is clicked.
 * @prop {String} [size=medium] The card size. Can be "small", "medium", or "large".
 * @prop {String} [layout=vertical] The card layout. Can be "vertical" or "horizontal".
 */

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
