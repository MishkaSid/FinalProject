// בקובץ זה נמצא דף לוח הבקרה של התרגול עבור סטודנטים
// הקובץ משתמש בתבנית TopicLandingTemplate להצגת מידע על נושא ותרגול
// הוא מספק נקודת כניסה לתרגול עבור נושא ספציפי
// Frontend/src/pages/student/practice/practice dashboard/PracticeDashboard.jsx
import React from "react";
import TopicLandingTemplate from "../../../../components/topic/TopicLandingTemplate";

/**
 * The PracticeDashboard component renders the Practice Dashboard page.
 *
 * This component is a simple wrapper around the TopicLandingTemplate
 * component, which is responsible for rendering the page's layout and
 * content.
 *
 * @returns {JSX.Element} A JSX element representing the Practice Dashboard
 * page.
 */
export default function PracticeDashboard() {
  return <TopicLandingTemplate />;
}
