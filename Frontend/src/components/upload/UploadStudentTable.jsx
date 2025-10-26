// בקובץ זה נמצא רכיב להעלאת קובץ אקסל של סטודנטים
// הקובץ מספק ממשק להעלאת קובץ אקסל עם רשימת משתמשים חדשים
// הוא משמש מנהלים להוספת מספר רב של סטודנטים בבת אחת למערכת
// Frontend/src/components/upload/UploadStudentTable.jsx
// This component lets an admin upload an Excel file to bulk-add users.
// If the server returns a PDF with errors, it auto-downloads it.
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./uploadStudentTable.module.css";
import Popup from "../popup/Popup";

/**
 * A React component that lets the user upload an Excel file to bulk-add users.
 * When the upload is complete, it calls the `onUsersAdded` callback (if provided).
 * @param {Object} props
 * @param {Function} [props.onUsersAdded]
 */
export default function UploadStudentTable({ onUsersAdded }) {
  const [isUploading, setUploading] = useState(false);
  const [showCoursePopup, setShowCoursePopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [showNewCourseInput, setShowNewCourseInput] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  function fetchCourses() {
    const token = localStorage.getItem("token");
    axios
      .get("/api/courses/getCourses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const fetchedCourses = res.data || [];
        setCourses(fetchedCourses);
        
        // Set default to "Math" course if it exists
        const mathCourse = fetchedCourses.find(
          (c) => c.CourseName?.toLowerCase() === "math"
        );
        if (mathCourse) {
          setSelectedCourseId(mathCourse.CourseID);
        }
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
      });
  }

  async function handleCreateCourse() {
    if (!newCourseName.trim()) {
      alert("יש להזין שם קורס");
      return;
    }

    try {
      const response = await axios.post("/api/courses/addCourse", {
        CourseName: newCourseName,
      });
      
      const newCourse = response.data;
      
      // Refresh courses list
      fetchCourses();
      
      // Select the new course
      setSelectedCourseId(newCourse.CourseID);
      setShowNewCourseInput(false);
      setNewCourseName("");
      
      alert(`הקורס "${newCourseName}" נוסף בהצלחה!`);
    } catch (err) {
      console.error("Error creating course:", err);
      alert(err.response?.data?.error || "שגיאה ביצירת קורס");
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store the file and show course selection popup
    setSelectedFile(file);
    setShowCoursePopup(true);
    
    // Clear input
    e.target.value = "";
  };

  const handleUploadWithCourse = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setShowCoursePopup(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("courseId", selectedCourseId || "");

      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("Content-Type") || "";

      // If server returned a PDF report - download automatically
      if (contentType.includes("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = 'דו"ח_שגיאות_קליטת_תלמידים.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        // Notify parent that processing happened (some rows may still have been added)
        if (typeof onUsersAdded === "function") onUsersAdded();
        return;
      }

      // Otherwise treat as JSON
      const data = await res.json();
      if (res.ok) {
        const { added = 0, errors = [], message } = data;
        if (errors.length > 0) {
          alert(
            message ||
              `Completed with errors. Added ${added}. Errors ${errors.length}.`
          );
        } else {
          alert(message || `Success. Added ${added}.`);
        }
        if (typeof onUsersAdded === "function" && added > 0) onUsersAdded();
      } else {
        alert(data?.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <button
          className={styles.container}
          disabled={isUploading}
        >
          {/* Upload icon */}
          <svg
            fill="#fff"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 50 50"
          >
            <path d="M28.8125 .03125L.8125 5.34375C.339844 5.433594 0 5.863281 0 6.34375L0 43.65625C0 44.136719 .339844 44.566406 .8125 44.65625L28.8125 49.96875C28.875 49.980469 28.9375 50 29 50C29.230469 50 29.445313 49.929688 29.625 49.78125C29.855469 49.589844 30 49.296875 30 49L30 1C30 .703125 29.855469 .410156 29.625 .21875C29.394531 .0273438 29.105469 -.0234375 28.8125 .03125ZM32 6L32 13L34 13L34 15L32 15L32 20L34 20L34 22L32 22L32 27L34 27L34 29L32 29L32 35L34 35L34 37L32 37L32 44L47 44C48.101563 44 49 43.101563 49 42L49 8C49 6.898438 48.101563 6 47 6ZM36 13L44 13L44 15L36 15ZM6.6875 15.6875L11.8125 15.6875L14.5 21.28125C14.710938 21.722656 14.898438 22.265625 15.0625 22.875L15.09375 22.875C15.199219 22.511719 15.402344 21.941406 15.6875 21.21875L18.65625 15.6875L23.34375 15.6875L17.75 24.9375L23.5 34.375L18.53125 34.375L15.28125 28.28125C15.160156 28.054688 15.035156 27.636719 14.90625 27.03125L14.875 27.03125C14.8125 27.316406 14.664063 27.761719 14.4375 28.34375L11.1875 34.375L6.1875 34.375L12.15625 25.03125ZM36 20L44 20L44 22L36 22ZM36 27L44 27L44 29L36 29ZM36 35L44 35L44 37L36 37Z"></path>
          </svg>
          {isUploading ? "Uploading…" : "Upload File"}
          <input
            type="file"
            accept=".xlsx,.xls"
            name="file"
            onChange={handleFileSelect}
            disabled={isUploading}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </button>
      </div>

      {/* Course Selection Popup */}
      {showCoursePopup && (
        <Popup
          header="בחר קורס לתלמידים"
          isOpen={showCoursePopup}
          onClose={() => {
            setShowCoursePopup(false);
            setSelectedFile(null);
          }}
        >
          <div style={{ padding: "1rem", minWidth: "400px" }}>
            <p style={{ marginBottom: "1rem", color: "#333" }}>
              לאיזה קורס תרצה להקצות את התלמידים מקובץ ה-Excel?
            </p>
            
            {!showNewCourseInput ? (
              <>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    fontSize: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">ללא קורס (אופציונלי)</option>
                  {courses.map((course) => (
                    <option key={course.CourseID} value={course.CourseID}>
                      {course.CourseName}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => setShowNewCourseInput(true)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  + צור קורס חדש
                </button>
              </>
            ) : (
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="text"
                  placeholder="שם הקורס החדש"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    fontSize: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={handleCreateCourse}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    שמור קורס
                  </button>
                  <button
                    onClick={() => {
                      setShowNewCourseInput(false);
                      setNewCourseName("");
                    }}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                onClick={handleUploadWithCourse}
                disabled={isUploading}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                {isUploading ? "מעלה..." : "העלה קובץ"}
              </button>
              <button
                onClick={() => {
                  setShowCoursePopup(false);
                  setSelectedFile(null);
                }}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}
