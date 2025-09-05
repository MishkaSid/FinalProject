import React from "react";
import styles from "../adminPages.module.css";
import Card from "../../../components/card/Card";

/**
 * @component TopicCard
 * @description A component that displays a single topic as a card with action buttons.
 * It uses the generic `Card` component to display the topic name and provides buttons for editing and deleting the topic.
 * @param {object} props - The component props.
 * @param {object} props.topic - The topic object to be displayed.
 * @param {Function} props.onSelect - The function to call when the card is clicked.
 * @param {Function} props.onEdit - The function to call when the edit button is clicked.
 * @param {Function} props.onDelete - The function to call when the delete button is clicked.
 * @returns {JSX.Element} The rendered topic card component.
 */
export default function TopicCard({ topic, onSelect, onEdit, onDelete }) {
  return (
    <div className={styles.topicCardContainer}>
      <Card title={topic.TopicName} onClick={onSelect} size="medium" />
      <div className={styles.topicActions}>
        <button className={styles.editButtonLarge} onClick={onEdit}>
          ערוך
        </button>
        <button className={styles.deleteButtonLarge} onClick={onDelete}>
          מחק
        </button>
      </div>
    </div>
  );
}
