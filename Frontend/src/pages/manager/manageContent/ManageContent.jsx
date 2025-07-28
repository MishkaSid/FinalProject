import React, { useState, useEffect } from "react";
import styles from "../adminPages.module.css";
import Popup from "../../../components/popup/Popup";
import axios from "axios";
import PracticeContent from "../../../components/practiceContent/PracticeContent";
import CourseSelector from "./CourseSelector";
import TopicList from "./TopicList";
import TopicForm from "./TopicForm";
import PracticeContentTable from "./PracticeContentTable";

/**
 * @component ManageContent
 * @description The main component for managing educational content. It allows users to manage courses,
 * topics within courses, and practice content within topics. It handles fetching data,
 * displaying it in a structured way, and provides UI for all CRUD (Create, Read, Update, Delete) operations
 * through various popups and forms.
 * @returns {JSX.Element} The rendered content management page.
 */
export default function ManageContent() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicPopupOpen, setIsTopicPopupOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [addTopicInitial, setAddTopicInitial] = useState({ TopicID: "", TopicName: "", CourseID: "" });
  const [practiceContent, setPracticeContent] = useState({}); // { [topicId]: [content, ...] }
  const [isAddContentPopupOpen, setIsAddContentPopupOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, topic: null });
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [deleteCourseConfirm, setDeleteCourseConfirm] = useState({ open: false, course: null });

  /**
   * @effect
   * @description Fetches all courses from the server when the component mounts.
   */
  useEffect(() => {
    axios.get("/api/courses/getCourses").then(res => {
      setCourses(res.data || []);
    });
  }, []);

  /**
   * @effect
   * @description Fetches all topics for the currently selected course. This effect runs
   * whenever the `selectedCourse` state changes.
   */
  useEffect(() => {
    if (!selectedCourse) return;
    axios.get("/api/topics/getTopics").then(res => {
      const filtered = (res.data || []).filter(t => t.CourseID === selectedCourse);
      setTopics(filtered);
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
    axios.get("/api/practice/practiceExercises").then(res => {
      const allContent = res.data || [];
      const map = {};
      topics.forEach(topic => {
        map[topic.TopicID] = allContent.filter(c => c.TopicID === topic.TopicID);
      });
      setPracticeContent(map);
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
    const course = courses.find(c => c.CourseID === courseId);
    setDeleteCourseConfirm({ open: true, course });
  };

  /**
   * @function handleAddTopic
   * @description Opens the popup for adding a new topic to the currently selected course.
   */
  const handleAddTopic = () => {
    setAddTopicInitial({ TopicID: "", TopicName: "", CourseID: selectedCourse });
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
   * @function handleAddTopicSubmit
   * @description Handles the form submission for adding a new topic. It sends the new topic data
   * to the server and updates the local state on success.
   * @param {object} values - The form values for the new topic.
   */
  const handleAddTopicSubmit = (values) => {
    const payload = { TopicName: values.TopicName, CourseID: selectedCourse };
    if (values.TopicID) payload.TopicID = Number(values.TopicID);
    axios.post("/api/topics/addTopic", payload)
      .then(res => {
        setTopics(prev => [...prev, res.data]);
        setIsAddTopicOpen(false);
      });
  };
  /**
   * @function handleEditTopicSubmit
   * @description Handles the form submission for editing a topic. It sends the updated topic data
   * to the server and updates the local state on success.
   * @param {object} values - The updated form values for the topic.
   */
  const handleEditTopicSubmit = (values) => {
    axios.put(`/api/topics/updateTopic/${editTopic.TopicID}`, {
      TopicName: values.TopicName,
      CourseID: selectedCourse,
      TopicID: values.TopicID
    }).then(res => {
      setTopics(prev => prev.map(t => t.TopicID === editTopic.TopicID ? { ...t, ...values } : t));
      setIsEditTopicOpen(false);
      setEditTopic(null);
    });
  };

  /**
   * @function handleDeleteTopicConfirm
   * @description Confirms and executes the deletion of a topic. It sends a delete request
   * to the server and removes the topic from the local state on success.
   */
  const handleDeleteTopicConfirm = () => {
    axios.delete(`/api/topics/deleteTopic/${deleteConfirm.topic.TopicID}`)
      .then(() => {
        setTopics(prev => prev.filter(t => t.TopicID !== deleteConfirm.topic.TopicID));
        setDeleteConfirm({ open: false, topic: null });
      });
  };

  /**
   * @function handleDeleteCourseConfirm
   * @description Confirms and executes the deletion of a course. It sends a delete request
   * to the server and removes the course from the local state on success.
   */
  const handleDeleteCourseConfirm = () => {
    axios.delete(`/api/courses/deleteCourse/${deleteCourseConfirm.course.CourseID}`)
      .then(() => {
        setCourses(prev => prev.filter(c => c.CourseID !== deleteCourseConfirm.course.CourseID));
        if (selectedCourse === deleteCourseConfirm.course.CourseID) setSelectedCourse(null);
        setDeleteCourseConfirm({ open: false, course: null });
      });
  };

  /**
   * @function handleDeleteContent
   * @description Deletes a specific piece of practice content. It sends a delete request
   * to the server and removes the content from the local state on success.
   * @param {number} exerciseId - The ID of the practice exercise to be deleted.
   */
  const handleDeleteContent = (exerciseId) => {
    axios.delete(`/api/practice/practiceExercise/${exerciseId}`)
      .then(() => {
        setPracticeContent(prev => ({
          ...prev,
          [selectedTopic.TopicID]: prev[selectedTopic.TopicID].filter(c => c.ExerciseID !== exerciseId)
        }));
      });
  };
  /**
   * @function handleContentAdded
   * @description A callback function that updates the practice content in the state after a new
   * piece of content has been successfully added.
   * @param {number} topicId - The ID of the topic the content was added to.
   * @param {object} newContent - The new practice content object that was added.
   */
  const handleContentAdded = (topicId, newContent) => {
    setPracticeContent(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), newContent]
    }));
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.pageTitle}>ניהול תכנים</h1>
      {/* Course Selector */}
      <CourseSelector
        courses={courses}
        selectedCourse={selectedCourse}
        onSelect={handleSelectCourse}
        onAdd={handleAddCourse}
        onDelete={handleDeleteCourse}
        onAddTopic={handleAddTopic}
      />
      
      {/* Add Course Popup */}
      <Popup isOpen={isAddCourseOpen} onClose={() => setIsAddCourseOpen(false)} header="הוסף קורס חדש">
        <form
          className={styles.form}
          onSubmit={e => {
            e.preventDefault();
            if (!newCourseName.trim()) return;
            axios.post("/api/courses/addCourse", { CourseName: newCourseName })
              .then(res => {
                setCourses(prev => [...prev, res.data]);
                setNewCourseName("");
                setIsAddCourseOpen(false);
              });
          }}
        >
          <div className={styles.inputContainer}>
            <label className={styles.label}>שם קורס</label>
            <input
              className={styles.input}
              type="text"
              value={newCourseName}
              onChange={e => setNewCourseName(e.target.value)}
            />
          </div>
          <button className={styles.submitButton} type="submit">הוסף</button>
          <button className={styles.smallButton} type="button" onClick={() => setIsAddCourseOpen(false)} style={{marginTop: 8}}>ביטול</button>
        </form>
      </Popup>
      {/* Delete Course Confirmation Popup */}
      <Popup isOpen={deleteCourseConfirm.open} onClose={() => setDeleteCourseConfirm({ open: false, course: null })} header="אישור מחיקת קורס">
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 18 }}>
            האם אתה בטוח שברצונך למחוק את הקורס "{deleteCourseConfirm.course?.CourseName}"?
          </div>
          <button
            className={styles.deleteButtonLarge}
            style={{ marginLeft: 8 }}
            onClick={handleDeleteCourseConfirm}
          >מחק</button>
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
          />
        </>
      )}
      {/* Add Topic Popup */}
      <Popup isOpen={isAddTopicOpen} onClose={() => setIsAddTopicOpen(false)} header="הוסף נושא חדש">
        <TopicForm
          initialValues={addTopicInitial}
          onSubmit={handleAddTopicSubmit}
          onClose={() => setIsAddTopicOpen(false)}
          mode="add"
        />
      </Popup>
      {/* Edit Topic Popup */}
      <Popup isOpen={isEditTopicOpen} onClose={() => setIsEditTopicOpen(false)} header="ערוך נושא">
        <TopicForm
          initialValues={editTopic || { TopicID: "", TopicName: "", CourseID: selectedCourse }}
          onSubmit={handleEditTopicSubmit}
          onClose={() => setIsEditTopicOpen(false)}
          mode="edit"
        />
      </Popup>
      {/* Delete Topic Confirmation Popup */}
      <Popup isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, topic: null })} header="אישור מחיקה">
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 18 }}>
            האם אתה בטוח שברצונך למחוק את הנושא "{deleteConfirm.topic?.TopicName}"?
          </div>
          <button
            className={styles.deleteButtonLarge}
            style={{ marginLeft: 8 }}
            onClick={handleDeleteTopicConfirm}
          >מחק</button>
        </div>
      </Popup>
      {/* Practice Content Popup (table and add content) */}
      <Popup isOpen={isTopicPopupOpen} onClose={() => setIsTopicPopupOpen(false)} header={selectedTopic?.TopicName || "תוכן נושא"}>
        <div className={`${styles.prominentPopup} ${styles.popupLarge}`}>
          <PracticeContentTable
            contentList={practiceContent[selectedTopic?.TopicID] || []}
            onDeleteContent={handleDeleteContent}
          />
          <button className={styles.addButton} onClick={() => setIsAddContentPopupOpen(true)}>הוסף תוכן</button>
          <PracticeContent
            topic={selectedTopic}
            isOpen={isAddContentPopupOpen}
            onClose={() => setIsAddContentPopupOpen(false)}
          />
        </div>
      </Popup>
    </div>
  );
}
