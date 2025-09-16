// בקובץ זה נמצא רכיב הרשימה להצגת נושאים במערכת
// הקובץ מציג רשימה של נושאים באמצעות רכיבי כרטיס נפרדים
// הוא מעביר פונקציות טיפול אירועים לכל כרטיס נושא ומנהל את הרשימה
// הוא משמש להצגת כל הנושאים הקיימים במערכת עבור מנהלים ומורים

// Frontend/src/pages/manager/manageContent/TopicList.jsx
import React from "react";
import styles from "../adminPages.module.css";
import TopicCard from "./TopicCard";

/**
 * @component TopicList
 * @description A component that renders a list of topics. It maps over an array of topic objects
 * and renders a `TopicCard` for each one, passing down the necessary event handlers.
 * @param {object} props - The component props.
 * @param {Array<object>} props.topics - An array of topic objects to be displayed.
 * @param {Function} props.onSelectTopic - The function to call when a topic card is selected.
 * @param {Function} props.onEditTopic - The function to call when the edit button on a topic card is clicked.
 * @param {Function} props.onDeleteTopic - The function to call when the delete button on a topic card is clicked.
 * @returns {JSX.Element} The rendered list of topic cards.
 */
export default function TopicList({ topics, onSelectTopic, onEditTopic, onDeleteTopic }) {
  return (
    <div className={styles.topicsList}>
      {topics.map((topic) => (
        <TopicCard
          key={topic.TopicID}
          topic={topic}
          onSelect={() => onSelectTopic(topic)}
          onEdit={() => onEditTopic(topic)}
          onDelete={() => onDeleteTopic(topic)}
        />
      ))}
    </div>
  );
} 