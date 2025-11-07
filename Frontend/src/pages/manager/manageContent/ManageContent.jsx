// בקובץ זה נמצא דף ניהול התוכן עבור מנהלים ומורים
// הקובץ מספק ממשק מלא לניהול קורסים, נושאים ותוכן תרגול
// הוא מאפשר פעולות CRUD מלאות על כל רכיבי התוכן הלימודי במערכת
// Frontend/src/pages/manager/manageContent/ManageContent.jsx
import React, { useState, useEffect } from "react";
import styles from "../adminPages.module.css";
import Popup from "../../../components/popup/Popup";
import axios from "axios";
import PracticeContent from "../../../components/practiceContent/PracticeContent";
import CourseSelector from "./CourseSelector";
import TopicList from "./TopicList";
import TopicForm from "./TopicForm";
import PracticeContentTable from "./PracticeContentTable";
import ManageContentModal from "../../../components/admin/ManageContentModal";
import { useAuth } from "../../../context/AuthContext";

/**
 * @component ManageContent
 * @description The main component for managing educational content. It allows users to manage courses,
 * topics within courses, and practice content within topics. It handles fetching data,
 * displaying it in a structured way, and provides UI for all CRUD (Create, Read, Update, Delete) operations
 * through various popups and forms.
 * @returns {JSX.Element} The rendered content management page.
 */
export default function ManageContent() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicPopupOpen, setIsTopicPopupOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [addTopicInitial, setAddTopicInitial] = useState({
    TopicName: "",
    TopicDescription: "",
    status: "active",
  });
  const [practiceContent, setPracticeContent] = useState({}); // { [topicId]: [content, ...] }
  const [isAddContentPopupOpen, setIsAddContentPopupOpen] = useState(false);
  const [isEditContentPopupOpen, setIsEditContentPopupOpen] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    topic: null,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [deleteCourseConfirm, setDeleteCourseConfirm] = useState({
    open: false,
    course: null,
  });
  const [isManageContentModalOpen, setIsManageContentModalOpen] = useState(false);
  const [selectedTopicForModal, setSelectedTopicForModal] = useState(null);
  const [isDuplicateTopicPopupOpen, setIsDuplicateTopicPopupOpen] = useState(false);
  const [duplicateTopicName, setDuplicateTopicName] = useState("");

  /**
   * @effect
   * @description Fetches all courses from the server when the component mounts.
   * Filters courses based on user's courseId if user is not an Admin.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("/api/courses/getCourses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      const allCourses = res.data || [];
      
      // If user is Admin, show all courses
      // Otherwise, filter by user's courseId
      if (user?.role === 'Admin') {
        setCourses(allCourses);
      } else if (user?.courseId) {
        const filteredCourses = allCourses.filter(
          course => course.CourseID === user.courseId
        );
        setCourses(filteredCourses);
        
        // Auto-select the user's course if only one course
        if (filteredCourses.length === 1) {
          setSelectedCourse(filteredCourses[0].CourseID);
        }
      } else {
        setCourses([]);
      }
    }).catch((err) => {
      console.error("Error fetching courses:", err);
      setMessage({ type: "error", text: "שגיאה בטעינת הקורסים" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    });
  }, [user]);

  /**
   * @effect
   * @description Fetches all topics for the currently selected course. This effect runs
   * whenever the `selectedCourse` state changes.
   */
  useEffect(() => {
    if (!selectedCourse) return;
    const token = localStorage.getItem("token");
    axios.get("/api/topics/getTopics", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      const filtered = (res.data || []).filter(
        (t) => t.CourseID === selectedCourse
      );
      setTopics(filtered);
    }).catch((err) => {
      console.error("Error fetching topics:", err);
      setMessage({ type: "error", text: "שגיאה בטעינת הנושאים" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    });
  }, [selectedCourse]);

  /**
   * @effect
   * @description Fetches all practice exercises for the topics that are currently displayed.
   * It creates a map of practice content, keyed by topic ID. This effect runs whenever the
   * `topics` state changes.
   */
  useEffect(() => {
    if (!topics.length) return;
    const token = localStorage.getItem("token");
    axios.get("/api/practice/practiceExercises", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      const allContent = res.data || [];
      const map = {};
      topics.forEach((topic) => {
        map[topic.TopicID] = allContent.filter(
          (c) => c.TopicID === topic.TopicID
        );
      });
      setPracticeContent(map);
    }).catch((err) => {
      console.error("Error fetching practice content:", err);
      setMessage({ type: "error", text: "שגיאה בטעינת תוכן התרגול" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    });
  }, [topics]);

  /**
   * @function handleSelectCourse
   * @description Updates the state with the ID of the currently selected course.
   * @param {number} courseId - The ID of the selected course.
   */
  const handleSelectCourse = (courseId) => setSelectedCourse(courseId);
  /**
   * @function handleAddCourse
   * @description Opens the popup for adding a new course.
   */
  const handleAddCourse = () => setIsAddCourseOpen(true);
  /**
   * @function handleDeleteCourse
   * @description Opens a confirmation popup before deleting a course.
   * @param {number} courseId - The ID of the course to be deleted.
   */
  const handleDeleteCourse = (courseId) => {
    const course = courses.find((c) => c.CourseID === courseId);
    setDeleteCourseConfirm({ open: true, course });
  };

  /**
   * @function updateCourseStatus
   * @description Updates the status of a course
   * @param {number} courseId - The ID of the course to update
   * @param {string} newStatus - The new status to set for the course
   */
  const updateCourseStatus = async (courseId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/courses/updateStatus/${courseId}`,
        { Status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update the local courses state
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course.CourseID === courseId
              ? { ...course, Status: newStatus }
              : course
          )
        );

        // Show success message
        setMessage({
          type: "success",
          text: `סטטוס הקורס עודכן בהצלחה ל: ${newStatus}`,
        });

        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      setMessage({
        type: "error",
        text: "שגיאה בעדכון סטטוס הקורס. אנא נסה שוב.",
      });

      // Clear error message after 5 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  /**
   * @function handleAddTopic
   * @description Opens the popup for adding a new topic to the currently selected course.
   */
  const handleAddTopic = () => {
    setAddTopicInitial({
      TopicName: "",
      TopicDescription: "",
      status: "active",
    });
    setIsAddTopicOpen(true);
  };
  /**
   * @function handleEditTopic
   * @description Opens the popup for editing an existing topic.
   * @param {object} topic - The topic object to be edited.
   */
  const handleEditTopic = (topic) => {
    setEditTopic(topic);
    setIsEditTopicOpen(true);
  };
  /**
   * @function handleDeleteTopic
   * @description Opens a confirmation popup before deleting a topic.
   * @param {object} topic - The topic object to be deleted.
   */
  const handleDeleteTopic = (topic) => setDeleteConfirm({ open: true, topic });
  /**
   * @function handleSelectTopic
   * @description Opens a popup displaying the details and practice content for a selected topic.
   * @param {object} topic - The selected topic object.
   */
  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setIsTopicPopupOpen(true);
  };

  /**
   * @function handleManageContent
   * @description Opens the manage content modal for a selected topic.
   * @param {object} topic - The selected topic object.
   */
  const handleManageContent = (topic) => {
    setSelectedTopicForModal(topic);
    setIsManageContentModalOpen(true);
  };

  /**
   * @function handleAddTopicSubmit
   * @description Handles the form submission for adding a new topic. It sends the new topic data
   * to the server and updates the local state on success. Admin users can specify CourseID.
   * @param {object} values - The form values for the new topic.
   */
  const handleAddTopicSubmit = (values) => {
    const token = localStorage.getItem("token");
    axios.post("/api/topics/addTopic", 
      { 
        TopicName: values.TopicName,
        TopicDescription: values.TopicDescription,
        CourseID: selectedCourse,  // Send the selected course ID
        status: values.status || 'active'  // Send the status
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then((res) => {
      setTopics((prev) => [...prev, res.data]);
      setIsAddTopicOpen(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }).catch((err) => {
      console.error("Error adding topic:", err);
      const errorMsg = err.response?.data?.error || "";
      
      // Check if it's a duplicate topic error
      if (errorMsg.includes("already exists") || errorMsg.includes("כבר קיים") || errorMsg.includes("duplicate")) {
        setDuplicateTopicName(values.TopicName);
        setIsDuplicateTopicPopupOpen(true);
        setIsAddTopicOpen(false);
      } else {
        // For other errors, show generic error message
        setMessage({ type: "error", text: errorMsg || "שגיאה בהוספת נושא" });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    });
  };
  /**
   * @function handleEditTopicSubmit
   * @description Handles the form submission for editing a topic. It sends the updated topic data
   * to the server and updates the local state on success.
   * @param {object} values - The updated form values for the topic.
   */
  const handleEditTopicSubmit = (values) => {
    const token = localStorage.getItem("token");
    axios
      .put(`/api/topics/updateTopic/${editTopic.TopicID}`, 
        { TopicName: values.TopicName, TopicDescription: values.TopicDescription, status: values.status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setTopics((prev) =>
          prev.map((t) =>
            t.TopicID === editTopic.TopicID ? { ...t, TopicName: values.TopicName, TopicDescription: values.TopicDescription, status: values.status } : t
          )
        );
        setIsEditTopicOpen(false);
        setEditTopic(null);
      })
      .catch((err) => {
        console.error("Error updating topic:", err);
        alert(err.response?.data?.error || "שגיאה בעדכון נושא");
      });
  };

  /**
   * @function handleDeleteTopicConfirm
   * @description Confirms and executes the deletion of a topic. It sends a delete request
   * to the server and removes the topic from the local state on success.
   */
  const handleDeleteTopicConfirm = () => {
    const token = localStorage.getItem("token");
    axios
      .delete(`/api/topics/deleteTopic/${deleteConfirm.topic.TopicID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setTopics((prev) =>
          prev.filter((t) => t.TopicID !== deleteConfirm.topic.TopicID)
        );
        setDeleteConfirm({ open: false, topic: null });
      })
      .catch((err) => {
        console.error("Error deleting topic:", err);
        alert(err.response?.data?.error || "שגיאה במחיקת נושא");
      });
  };

  /**
   * @function handleDeleteCourseConfirm
   * @description Confirms and executes the deletion of a course and all its related content.
   * This includes all topics, practice exercises, videos, and exam questions.
   * This action is permanent and cannot be undone.
   */
  const handleDeleteCourseConfirm = () => {
    const token = localStorage.getItem("token");
    const courseId = deleteCourseConfirm.course.CourseID;
    
    axios
      .delete(
        `/api/courses/deleteCourse/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // Remove the deleted course from state
        setCourses((prev) =>
          prev.filter((c) => c.CourseID !== courseId)
        );
        
        // If this was the selected course, clear selection and topics
        if (selectedCourse === courseId) {
          setSelectedCourse(null);
          setTopics([]);
          setPracticeContent({});
        }
        
        setDeleteCourseConfirm({ open: false, course: null });
        
        const deletedTopicsCount = res.data?.deletedTopics || 0;
        
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      })
      .catch((err) => {
        console.error("Error deleting course:", err);
        const errorMsg = err.response?.data?.error || "שגיאה במחיקת הקורס";
        setDeleteCourseConfirm({ open: false, course: null });
        setMessage({ type: "error", text: errorMsg });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      });
  };

  /**
   * @function handleEditContent
   * @description Opens the popup for editing an existing practice content.
   * @param {object} content - The practice content object to be edited.
   */
  const handleEditContent = (content) => {
    setEditContent(content);
    setIsEditContentPopupOpen(true);
  };

  /**
   * @function handleEditContentSubmit
   * @description Handles the form submission for editing practice content. It sends the updated data
   * to the server and updates the local state on success.
   * @param {object} values - The updated form values for the practice content.
   */
  const handleEditContentSubmit = (values) => {
    const token = localStorage.getItem("token");
    axios
      .put(`/api/practice/practiceExercise/${editContent.ExerciseID}`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPracticeContent((prev) => ({
          ...prev,
          [selectedTopic.TopicID]: prev[selectedTopic.TopicID].map((c) =>
            c.ExerciseID === editContent.ExerciseID ? { ...c, ...values } : c
          ),
        }));
        setIsEditContentPopupOpen(false);
        setEditContent(null);
        setMessage({ type: "success", text: "התוכן עודכן בהצלחה!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      })
      .catch((err) => {
        console.error("Error updating practice content:", err);
        setMessage({ type: "error", text: "שגיאה בעדכון התוכן. אנא נסה שוב." });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      });
  };

  /**
   * @function handleDeleteContent
   * @description Deletes a specific piece of practice content. It sends a delete request
   * to the server and removes the content from the local state on success.
   * @param {number} exerciseId - The ID of the practice exercise to be deleted.
   */
  const handleDeleteContent = (exerciseId) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`/api/practice/practiceExercise/${exerciseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setPracticeContent((prev) => ({
          ...prev,
          [selectedTopic.TopicID]: prev[selectedTopic.TopicID].filter(
            (c) => c.ExerciseID !== exerciseId
          ),
        }));
        setMessage({ type: "success", text: "התוכן נמחק בהצלחה!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      })
      .catch((err) => {
        console.error("Error deleting practice content:", err);
        setMessage({ type: "error", text: "שגיאה במחיקת התוכן. אנא נסה שוב." });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      });
  };
  /**
   * @function handleContentAdded
   * @description A callback function that updates the practice content in the state after a new
   * piece of content has been successfully added. It also refreshes the data from the server
   * to ensure the table shows the most up-to-date information.
   * @param {number} topicId - The ID of the topic the content was added to.
   * @param {object} newContent - The new practice content object that was added.
   */
  const handleContentAdded = (topicId, newContent) => {
    // Update local state immediately for better UX
    setPracticeContent((prev) => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), newContent],
    }));

    // Refresh practice content data from server to ensure consistency
    const token = localStorage.getItem("token");
    axios.get("/api/practice/practiceExercises", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      const allContent = res.data || [];
      const map = {};
      topics.forEach((topic) => {
        map[topic.TopicID] = allContent.filter(
          (c) => c.TopicID === topic.TopicID
        );
      });
      setPracticeContent(map);
    }).catch((err) => {
      console.error("Error refreshing practice content:", err);
    });
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.pageTitle}>ניהול תכנים</h1>

      {/* Message Display */}
      {message.text && (
        <div
          className={`${styles.message} ${
            message.type === "success"
              ? styles.successMessage
              : styles.errorMessage
          }`}
          style={{
            padding: "1rem",
            margin: "1rem 0",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {message.text}
        </div>
      )}
      {/* Course Selector */}
      <CourseSelector
        courses={courses}
        selectedCourse={selectedCourse}
        onSelect={handleSelectCourse}
        onAdd={handleAddCourse}
        onDelete={handleDeleteCourse}
        onAddTopic={handleAddTopic}
        onUpdateStatus={updateCourseStatus}
      />

      {/* Add Course Popup */}
      <Popup
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
        header="הוסף קורס חדש"
      >
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (!newCourseName.trim()) return;
            const token = localStorage.getItem("token");
            axios
              .post("/api/courses/addCourse", { CourseName: newCourseName }, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              .then((res) => {
                setCourses((prev) => [...prev, res.data]);
                setNewCourseName("");
                setIsAddCourseOpen(false);
              })
              .catch((err) => {
                console.error("Error adding course:", err);
                alert(err.response?.data?.error || "שגיאה בהוספת קורס");
              });
          }}
        >
          <div className={styles.inputContainer}>
            <label className={styles.label}>שם קורס</label>
            <input
              className={styles.input}
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%' }}>
            <button className={styles.submitButton} type="submit" style={{ flex: 1 }}>
              הוסף
            </button>
            <button
              className={styles.smallButton}
              type="button"
              onClick={() => setIsAddCourseOpen(false)}
              style={{ flex: 1, padding: '0.7rem 1.2rem' }}
            >
              ביטול
            </button>
          </div>
        </form>
      </Popup>
      {/* Delete Course Confirmation Popup */}
      <Popup
        isOpen={deleteCourseConfirm.open}
        onClose={() => setDeleteCourseConfirm({ open: false, course: null })}
        header="⚠️ אזהרה - מחיקת קורס"
      >
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ 
            fontSize: 18, 
            marginBottom: 18,
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            האם אתה בטוח שברצונך למחוק את הקורס "{deleteCourseConfirm.course?.CourseName}"?
          </div>
          <div style={{ 
            fontSize: 16, 
            marginBottom: 24, 
            color: '#e74c3c',
            backgroundColor: '#ffebee',
            padding: '16px',
            borderRadius: '8px',
            border: '2px solid #e74c3c',
            lineHeight: '1.6'
          }}>
            <strong style={{ fontSize: 18 }}>⚠️ אזהרה!</strong>
            <br/><br/>
            לחיצה על אישור תמחק את הקורס ואת כל התוכן של הנושאים אשר משוייכים אליו!
            <br/><br/>
            <strong>פעולה זו היא קבועה ולא ניתנת לביטול.</strong>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              className={styles.deleteButtonLarge}
              onClick={handleDeleteCourseConfirm}
              style={{ 
                minWidth: '140px',
                fontSize: '1.1rem'
              }}
            >
              🗑️ אישור מחיקה
            </button>
            <button
              className={styles.addButton}
              onClick={() => setDeleteCourseConfirm({ open: false, course: null })}
              style={{ 
                minWidth: '140px',
                fontSize: '1.1rem',
                backgroundColor: '#6c757d'
              }}
            >
              ❌ ביטול
            </button>
          </div>
        </div>
      </Popup>
      {/* Topic List */}
      {selectedCourse && (
        <>
          <TopicList
            topics={topics}
            onSelectTopic={handleSelectTopic}
            onEditTopic={handleEditTopic}
            onDeleteTopic={handleDeleteTopic}
            onManageContent={handleManageContent}
          />
        </>
      )}
      {/* Add Topic Popup */}
      <Popup
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        header="הוסף נושא חדש"
      >
        <TopicForm
          initialValues={addTopicInitial}
          onSubmit={handleAddTopicSubmit}
          onClose={() => setIsAddTopicOpen(false)}
          mode="add"
        />
      </Popup>
      {/* Edit Topic Popup */}
      <Popup
        isOpen={isEditTopicOpen}
        onClose={() => setIsEditTopicOpen(false)}
        header="ערוך נושא"
      >
        <TopicForm
          initialValues={
            editTopic || {
              TopicName: "",
            }
          }
          onSubmit={handleEditTopicSubmit}
          onClose={() => setIsEditTopicOpen(false)}
          mode="edit"
        />
      </Popup>
      {/* Delete Topic Confirmation Popup */}
      <Popup
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, topic: null })}
        header="אישור מחיקה"
      >
        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 18 }}>
            האם אתה בטוח שברצונך למחוק את הנושא "
            {deleteConfirm.topic?.TopicName}"?
          </div>
          <button
            className={styles.deleteButtonLarge}
            style={{ marginLeft: 8 }}
            onClick={handleDeleteTopicConfirm}
          >
            מחק
          </button>
        </div>
      </Popup>
      {/* Practice Content Popup (table and add content) */}
      <Popup
        isOpen={isTopicPopupOpen}
        onClose={() => setIsTopicPopupOpen(false)}
        header={selectedTopic?.TopicName || "תוכן נושא"}
      >
        <div className={`${styles.prominentPopup} ${styles.popupLarge}`}>
          <PracticeContentTable
            contentList={practiceContent[selectedTopic?.TopicID] || []}
            onDeleteContent={handleDeleteContent}
            onEditContent={handleEditContent}
          />
          <button
            className={styles.addButton}
            onClick={() => setIsAddContentPopupOpen(true)}
          >
            הוסף תוכן
          </button>
          <PracticeContent
            topic={selectedTopic}
            isOpen={isAddContentPopupOpen}
            onClose={() => setIsAddContentPopupOpen(false)}
            onContentAdded={handleContentAdded}
          />
        </div>
      </Popup>

      {/* Edit Content Popup */}
      <Popup
        isOpen={isEditContentPopupOpen}
        onClose={() => {
          setIsEditContentPopupOpen(false);
          setEditContent(null);
        }}
        header="ערוך תוכן תרגול"
      >
        <PracticeContent
          topic={selectedTopic}
          isOpen={isEditContentPopupOpen}
          onClose={() => {
            setIsEditContentPopupOpen(false);
            setEditContent(null);
          }}
          onContentAdded={handleEditContentSubmit}
          initialValues={editContent}
          mode="edit"
        />
      </Popup>

      {/* Manage Content Modal */}
      <ManageContentModal
        isOpen={isManageContentModalOpen}
        onClose={() => {
          setIsManageContentModalOpen(false);
          setSelectedTopicForModal(null);
        }}
        topicId={selectedTopicForModal?.TopicID}
        topicName={selectedTopicForModal?.TopicName}
      />

      {/* Duplicate Topic Name Error Popup */}
      <Popup
        isOpen={isDuplicateTopicPopupOpen}
        onClose={() => {
          setIsDuplicateTopicPopupOpen(false);
          setDuplicateTopicName("");
        }}
        header="⚠️ שם נושא כפול"
      >
        <div style={{ 
          padding: "2rem", 
          textAlign: "center",
          direction: "rtl"
        }}>
          <div style={{ 
            fontSize: 18, 
            marginBottom: 20,
            color: '#2c3e50',
            lineHeight: '1.6'
          }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16
            }}>
              ⚠️
            </div>
            <strong>כבר קיים נושא בשם "{duplicateTopicName}"</strong>
            <br/><br/>
            אנא בחר שם אחר
          </div>
       
          <button
            className={styles.addButton}
            onClick={() => {
              setIsDuplicateTopicPopupOpen(false);
              setDuplicateTopicName("");
              setIsAddTopicOpen(true);
            }}
            style={{ 
              marginTop: 24,
              minWidth: '160px',
              fontSize: '1.1rem'
            }}
          >
            ✏️ נסה שוב
          </button>
        </div>
      </Popup>
    </div>
  );
}
