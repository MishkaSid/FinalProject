import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from "react-icons/fi";
import styles from "./AdminPages.module.css";

const AdminExamQuestionsPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // הוסף למעלה, מחוץ לקומפוננטה או בתוכה לפני השימוש
  const normalizeOptions = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const p = JSON.parse(val);
        if (Array.isArray(p)) return p;
        if (p && typeof p === "object") return Object.values(p);
        return [];
      } catch {
        return [];
      }
    }
    if (val && typeof val === "object") return Object.values(val);
    return [];
  };

  const resolveImg = (src) => {
    if (!src) return "";
    // אם זה כבר URL מלא או מתחיל ב־/
    if (/^https?:\/\//i.test(src) || src.startsWith("/")) return src;
    // אם זה שם קובץ כמו q1.png
    return `/uploads/exam-questions/${src}`;
  };

  // תמונת שאלה חדשה בעת יצירה
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    // questionPicURL נשמר לעריכה בלבד. ביצירה נשתמש ב-imageFile
    questionPicURL: "",
    answerOptions: ["", "", "", ""],
    correctAnswer: "",
  });

  useEffect(() => {
    fetchQuestions();
  }, [topicId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/topics/${topicId}/exam-questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ממפה מערך אפשרויות ל־A,B,C,D
  const mapOptionsToABCD = (arr) => {
    const [A, B, C, D, ...rest] = arr;
    const mapped = {};
    if (A) mapped.A = A;
    if (B) mapped.B = B;
    if (C) mapped.C = C;
    if (D) mapped.D = D;
    // מתעלמים מעודפים מעבר ל־4
    return mapped;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // עריכה קיימת: נשארים ב־PUT JSON. לא מחליפים תמונה כאן.
      if (editingQuestion) {
        const url = `http://localhost:5000/api/exam-questions/${editingQuestion.questionId}`;
        const body = {
          ...formData,
          // וידוא שהמבנה הנשלח נשאר תואם ל־API שלך
          topicId: parseInt(topicId),
        };

        const resp = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          const d = await resp.json().catch(() => ({}));
          throw new Error(d.error || "Failed to save question");
        }
      } else {
        // יצירה חדשה: שולחים multipart עם תמונה
        if (!imageFile) {
          setError("יש לבחור תמונה לשאלה");
          return;
        }

        // בונים JSON של אופציות A,B,C,D
        const optionsObj = mapOptionsToABCD(formData.answerOptions);

        // ולידציה בסיסית לתשובה נכונה
        const correct = String(formData.correctAnswer || "").trim();
        if (!correct || !optionsObj[correct]) {
          setError("התשובה הנכונה חייבת להיות אחת מהמפתחות A,B,C,D שקיבלו ערך");
          return;
        }

        const fd = new FormData();
        fd.append("image", imageFile);
        fd.append("topicId", String(parseInt(topicId)));
        fd.append("correctAnswer", correct);
        fd.append("optionsJson", JSON.stringify(optionsObj));

        const resp = await fetch(
          `http://localhost:5000/api/exam-questions/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: fd,
          }
        );

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          throw new Error(data.error || "Upload failed");
        }
      }

      // איפוס טופס ורענון
      setShowForm(false);
      setEditingQuestion(null);
      setFormData({
        questionPicURL: "",
        answerOptions: ["", "", "", ""],
        correctAnswer: "",
      });
      setImageFile(null);
      setImagePreview("");
      await fetchQuestions();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      // אם ה־API מחזיר imageUrl, נשמור אותו בשדה המקומי לשם הצגה בלבד
      questionPicURL: question.questionPicURL || question.imageUrl || "",
      answerOptions: question.answerOptions || ["", "", "", ""],
      correctAnswer: question.correctAnswer || "",
    });
    setImageFile(null);
    setImagePreview("");
    setShowForm(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את השאלה?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/exam-questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    navigate("/manager/manageContent");
  };

  const addAnswerOption = () => {
    setFormData({
      ...formData,
      answerOptions: [...formData.answerOptions, ""],
    });
  };

  const removeAnswerOption = (index) => {
    if (formData.answerOptions.length > 2) {
      const newOptions = formData.answerOptions.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        answerOptions: newOptions,
      });
    }
  };

  const updateAnswerOption = (index, value) => {
    const newOptions = [...formData.answerOptions];
    newOptions[index] = value;
    setFormData({
      ...formData,
      answerOptions: newOptions,
    });
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.loading}>טוען...</div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={handleBack}>
          <FiArrowRight /> חזור
        </button>
        <h1 className={styles.pageTitle}>ניהול שאלות למבחן</h1>
        <button
          className={styles.addButton}
          onClick={() => {
            setEditingQuestion(null);
            setFormData({
              questionPicURL: "",
              answerOptions: ["", "", "", ""],
              correctAnswer: "",
            });
            setImageFile(null);
            setImagePreview("");
            setShowForm(true);
          }}
        >
          <FiPlus /> הוסף שאלה
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {showForm && (
        <div className={styles.formModal}>
          <div className={styles.formContent}>
            <h2>{editingQuestion ? "עריכת שאלה" : "הוספת שאלה חדשה"}</h2>
            <form onSubmit={handleSubmit}>
              {!editingQuestion ? (
                <div className={styles.formGroup}>
                  <label>תמונת שאלה:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    required
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{ maxWidth: 240, display: "block", marginTop: 8 }}
                    />
                  )}
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>קישור תמונה קיים:</label>
                  <input
                    type="url"
                    value={formData.questionPicURL}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        questionPicURL: e.target.value,
                      })
                    }
                    placeholder="קישור קיים בלבד בעריכה"
                    disabled
                  />
                  <small>כדי להחליף תמונה, צור שאלה חדשה עם תמונה</small>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>אפשרויות תשובה:</label>
                {formData.answerOptions.map((option, index) => (
                  <div key={index} className={styles.answerOption}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        updateAnswerOption(index, e.target.value)
                      }
                      placeholder={`אפשרות ${index + 1}`}
                      required
                    />
                    {formData.answerOptions.length > 2 && (
                      <button
                        type="button"
                        className={styles.removeOption}
                        onClick={() => removeAnswerOption(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addOption}
                  onClick={addAnswerOption}
                >
                  הוסף אפשרות
                </button>
              </div>

              <div className={styles.formGroup}>
                <label>תשובה נכונה:</label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({ ...formData, correctAnswer: e.target.value })
                  }
                  required
                >
                  <option value="">בחר תשובה</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  {editingQuestion ? "עדכן" : "שמור"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>תמונה</th>
              <th>אפשרויות תשובה</th>
              <th>תשובה נכונה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => {
              const rawImg = question.imageUrl || question.questionPicURL;
              const img = resolveImg(rawImg);

              return (
                <tr key={question.questionId}>
                  <td>
                    {img ? (
                      <img
                        src={img}
                        alt="Question"
                        className={styles.questionImage}
                      />
                    ) : (
                      <span>ללא תמונה</span>
                    )}
                  </td>
                  <td>
                    <ul className={styles.answerList}>
                      {normalizeOptions(question.answerOptions).map(
                        (option, index) => (
                          <li key={index}>{option}</li>
                        )
                      )}
                    </ul>
                  </td>
                  <td>{question.correctAnswer}</td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(question)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(question.questionId)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminExamQuestionsPage;
