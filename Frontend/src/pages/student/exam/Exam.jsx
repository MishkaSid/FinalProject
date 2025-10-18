// בקובץ זה נמצא דף המבחן הכללי עבור סטודנטים
// הקובץ מספק ממשק מלא למבחן עם טיימר, ניווט בין שאלות ושמירת תוצאות
// הוא מטפל בכל תהליך המבחן מהתחלה ועד הצגת התוצאות הסופיות
// Frontend/src/pages/student/exam/Exam.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiClock,
  FiAlertTriangle,
  FiSave,
} from "react-icons/fi";
import styles from "./exam.module.css";
import { useAuth } from "../../../context/AuthContext";

/**
 * Exam component - renders the exam page with question navigation, exam content, and results display
 * @returns {JSX.Element} - the exam component
 */
export default function Exam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingExam, setSubmittingExam] = useState(false);

  const [examStats, setExamStats] = useState({
    totalQuestions: 0,
    answeredQuestions: 0,
    timeRemaining: 0,
    startTime: null,
  });

  // Server URL
  const SERVER_URL = "http://localhost:5000";

  // Exam duration in minutes
  const EXAM_DURATION_MINUTES = 60;

  // auth redirect and data fetch
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchExamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // timer
  useEffect(() => {
    if (examStats.startTime && !examCompleted) {
      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - examStats.startTime) / 1000);
        const remaining = EXAM_DURATION_MINUTES * 60 - elapsed;

        if (remaining <= 0) {
          handleTimeUp();
        } else {
          setExamStats((prev) => ({
            ...prev,
            timeRemaining: remaining,
          }));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStats.startTime, examCompleted]);

  // build safe image url for display
  // מחליף את resolveExamImageUrl הקיים
  const resolveExamImageUrl = (val) => {
    if (!val) return "";
    const raw = String(val).trim();

    const SERVER = "http://localhost:5000";

    // אם יש URL מלא, נחליט אם לכבד או להמיר
    if (/^https?:\/\//i.test(raw)) {
      try {
        const u = new URL(raw);
        // אם זה שרת הלוקאל שלנו, כבד אותו
        const isLocalHost =
          u.hostname === "localhost" || u.hostname === "127.0.0.1";
        const isOurPort = !u.port || u.port === "5000";
        if (isLocalHost && isOurPort) {
          return raw;
        }
        // אחר: ממירים לשם קובץ ולנתיב מקומי
        const fileOnly = u.pathname.split("/").pop() || "";
        return `${SERVER}/uploads/exam-questions/${fileOnly}`;
      } catch {
        // אם ה־URL לא תקין, ניפול לשם קובץ
        const fileOnly = raw.split("/").pop() || "";
        return `${SERVER}/uploads/exam-questions/${fileOnly}`;
      }
    }

    // אם כבר מתחיל ב־/uploads, הפוך ל־URL מלא
    if (raw.startsWith("/uploads/")) {
      return `${SERVER}${raw}`;
    }

    // במקרה שנתיב פגום: "/uploads/exam-questions/https://..."
    const httpIndex = raw.indexOf("http");
    if (httpIndex > -1) {
      const maybeUrl = raw.slice(httpIndex);
      try {
        const u = new URL(maybeUrl);
        const fileOnly = u.pathname.split("/").pop() || "";
        return `${SERVER}/uploads/exam-questions/${fileOnly}`;
      } catch {
        // ניפול לשם קובץ
        const fileOnly = raw.split("/").pop() || "";
        return `${SERVER}/uploads/exam-questions/${fileOnly}`;
      }
    }

    // שם קובץ בלבד
    const fileOnly = raw.split("/").pop() || raw;
    return `${SERVER}/uploads/exam-questions/${fileOnly}`;
  };

  /**
   * Fetch exam data from server
   */
  const fetchExamData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const resp = await fetch(`${SERVER_URL}/api/exams/start`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        // אם עובדים עם קוקיז HttpOnly במקום Bearer:
        // credentials: "include"
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Failed to start exam: ${resp.status} ${t}`);
      }
      const data = await resp.json();
      const qs = Array.isArray(data?.exam?.questions)
        ? data.exam.questions
        : [];
      if (!qs.length) throw new Error("No exam questions returned");
      setExercises(qs);
      setExamStats({
        totalQuestions: qs.length,
        answeredQuestions: 0,
        timeRemaining: EXAM_DURATION_MINUTES * 60,
        startTime: Date.now(),
      });
    } catch (err) {
      console.error("Error fetching exam data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // answer select
  const handleAnswerSelect = (answer) => {
    const questionId = exercises[currentExerciseIndex].ExerciseID;
    const newAnswers = { ...selectedAnswers, [questionId]: answer };
    setSelectedAnswers(newAnswers);

    const answeredCount = Object.keys(newAnswers).length;
    setExamStats((prev) => ({
      ...prev,
      answeredQuestions: answeredCount,
    }));
  };

  // nav
  const handleNextQuestion = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
    }
  };
  const handlePreviousQuestion = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((i) => i - 1);
    }
  };

  // submit dialog
  const handleSubmitExam = async () => {
    if (
      window.confirm(
        "האם אתה בטוח שברצונך להגיש את המבחן? לא תוכל לשנות תשובות לאחר ההגשה."
      )
    ) {
      try {
        setSubmittingExam(true);
        await calculateResults();
        setExamCompleted(true);
        setShowResults(true);
      } catch (error) {
        console.error("Error calculating results:", error);
        setExamCompleted(true);
        setShowResults(true);
      } finally {
        setSubmittingExam(false);
      }
    }
  };

  // time up
  const handleTimeUp = async () => {
    alert("הזמן נגמר! המבחן יוגש אוטומטית.");
    try {
      await calculateResults();
      setExamCompleted(true);
      setShowResults(true);
    } catch (error) {
      console.error("Error calculating results on time up:", error);
      setExamCompleted(true);
      setShowResults(true);
    }
  };

  // calculate and save
  const calculateResults = async () => {
    let correctAnswers = 0;
    const results = {};

    exercises.forEach((exercise) => {
      const questionId = exercise.ExerciseID;
      const selectedAnswer = selectedAnswers[questionId];

      if (selectedAnswer != null) {
        let answerOptions = [];
        try {
          if (exercise.AnswerOptions) {
            answerOptions =
              typeof exercise.AnswerOptions === "string"
                ? JSON.parse(exercise.AnswerOptions)
                : exercise.AnswerOptions;
          }
        } catch (error) {
          console.warn("Failed to parse AnswerOptions:", error);
          answerOptions = [];
        }

        let correctAnswerText = exercise.CorrectAnswer;
        const correctStr = String(exercise.CorrectAnswer || "").trim();
        if (["A", "B", "C", "D"].includes(correctStr.toUpperCase())) {
          const idx = correctStr.toUpperCase().charCodeAt(0) - 65;
          if (idx >= 0 && idx < answerOptions.length) {
            correctAnswerText = answerOptions[idx];
          }
        }

        const isCorrect =
          String(selectedAnswer).trim() === String(correctAnswerText).trim();
        if (isCorrect) correctAnswers++;

        results[questionId] = {
          selected: selectedAnswer,
          correct: correctAnswerText,
          isCorrect,
        };
      }
    });

    const finalScore = ((correctAnswers / exercises.length) * 100).toFixed(1);
    await saveExamResults(finalScore, results);

    setExamStats((prev) => ({
      ...prev,
      finalScore,
      correctAnswers,
      results,
    }));
  };

  // save results
  const saveExamResults = async (finalScore, results) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return false;
      }

      const userId = user?.id || user?.UserID;
      const examData = {
        userId,
        score: finalScore,
        // מאחסן מיפוי מפורט לשימוש עתידי
        answers: Object.entries(results).map(([qid, r], i) => ({
          questionId: Number(qid),
          position: i + 1,
          isCorrect: !!r.isCorrect,
          grade: r.isCorrect ? 100 : 0,
        })),
        timeSpent: EXAM_DURATION_MINUTES * 60 - examStats.timeRemaining,
        completedAt: new Date().toISOString(),
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${SERVER_URL}/api/student/exam/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        // אם עובדים עם קוקיז HttpOnly:
        // credentials: "include"
        body: JSON.stringify(examData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Exam results saved successfully:", result);
        return true;
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to save exam results:",
          response.status,
          errorText
        );
        return false;
      }
    } catch (error) {
      console.error("Error saving exam results:", error);
      return false;
    }
  };

  // back to dashboard
  const handleBackToDashboard = () => {
    const event = new CustomEvent("examCompleted", {
      detail: { userId: user?.id || user?.UserID },
    });
    window.dispatchEvent(event);
    setTimeout(() => navigate("/student", { replace: true }), 100);
  };

  const handleRetakeExam = () => {
    if (window.confirm("האם אתה בטוח שברצונך לקחת את המבחן שוב?")) {
      window.location.reload();
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען מבחן...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>שגיאה בטעינת המבחן</h2>
          <p>{error}</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noExercisesContainer}>
          <h2>אין שאלות במבחן</h2>
          <p>לא נמצאו שאלות למבחן זה</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;
  const isLastQuestion = currentExerciseIndex === exercises.length - 1;
  const isFirstQuestion = currentExerciseIndex === 0;

  // Parse answer options safely
  let answerOptions = [];
  try {
    if (currentExercise.AnswerOptions) {
      answerOptions =
        typeof currentExercise.AnswerOptions === "string"
          ? JSON.parse(currentExercise.AnswerOptions)
          : currentExercise.AnswerOptions;
    }
  } catch (error) {
    console.warn("Failed to parse AnswerOptions:", error);
    answerOptions = [];
  }

  // Correct answer text (supports A,B,C,D)
  let correctAnswerText = currentExercise.CorrectAnswer;
  const correctStr = String(currentExercise.CorrectAnswer || "").trim();
  if (["A", "B", "C", "D"].includes(correctStr.toUpperCase())) {
    const idx = correctStr.toUpperCase().charCodeAt(0) - 65;
    if (idx >= 0 && idx < answerOptions.length) {
      correctAnswerText = answerOptions[idx];
    }
  }

  const currentQuestionId = currentExercise.ExerciseID;
  const currentSelectedAnswer = selectedAnswers[currentQuestionId];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBackToDashboard} className={styles.backButton}>
          <FiArrowLeft />
          חזור לדשבורד
        </button>
        <div className={styles.headerInfo}>
          <h1>מבחן כללי - כל הנושאים</h1>
        </div>
        <div className={styles.examInfo}>
          <div className={styles.timeDisplay}>
            <FiClock className={styles.timeIcon} />
            <span
              className={
                examStats.timeRemaining <= 300 ? styles.timeWarning : ""
              }
            >
              {formatTime(examStats.timeRemaining)}
            </span>
          </div>
          <div className={styles.progressInfo}>
            <span>
              {currentExerciseIndex + 1} מתוך {exercises.length}
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className={styles.questionNavigation}>
        <h3>ניווט בין שאלות:</h3>
        <div className={styles.questionGrid}>
          {exercises.map((exercise, index) => {
            const questionId = exercise.ExerciseID;
            const isAnswered = selectedAnswers[questionId];
            const isCurrent = index === currentExerciseIndex;

            return (
              <button
                key={questionId}
                className={`${styles.questionNavButton} ${
                  isCurrent ? styles.current : ""
                } ${isAnswered ? styles.answered : styles.unanswered}`}
                onClick={() => setCurrentExerciseIndex(index)}
                disabled={examCompleted}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exam Content */}
      <div className={styles.examContainer}>
        <div className={styles.examHeader}>
          <h2>שאלה {currentExerciseIndex + 1}</h2>
          <div className={styles.questionStatus}>
            {currentSelectedAnswer ? (
              <span className={styles.answered}>ענית</span>
            ) : (
              <span className={styles.unanswered}>לא ענית</span>
            )}
          </div>
        </div>

        <div className={styles.examContent}>
          {currentExercise.ContentType === "image" && (
            <div className={styles.imageContainer}>
              <img
                src={resolveExamImageUrl(currentExercise?.ContentValue)}
                alt="Question content"
                className={styles.questionImage}
                onError={(e) => {
                  console.warn("Failed to load image:", e.currentTarget.src);
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {currentExercise.ContentType === "text" && (
            <div className={styles.textContainer}>
              <p>{currentExercise.ContentValue}</p>
            </div>
          )}

          <div className={styles.answerOptions}>
            <h3>בחר תשובה:</h3>
            <div className={styles.answerOptionsGrid}>
              {answerOptions.map((option, index) => {
                const isSelected = currentSelectedAnswer === option;

                return (
                  <button
                    key={index}
                    className={`${styles.answerOption} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={() => !examCompleted && handleAnswerSelect(option)}
                    disabled={examCompleted}
                  >
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className={styles.optionText}>{option}</span>
                    {examCompleted && showResults && (
                      <>
                        {examStats.results?.[currentQuestionId]?.correct ===
                          option && <FiCheck className={styles.correctIcon} />}
                        {examStats.results?.[currentQuestionId]?.selected ===
                          option &&
                          !examStats.results?.[currentQuestionId]
                            ?.isCorrect && (
                            <FiX className={styles.incorrectIcon} />
                          )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {!examCompleted && (
          <div className={styles.submitSection}>
            <div className={styles.submitInfo}>
              <FiAlertTriangle className={styles.warningIcon} />
              <span>
                ענית על {examStats.answeredQuestions} מתוך{" "}
                {examStats.totalQuestions} שאלות
              </span>
            </div>
            <button
              className={styles.submitExamButton}
              onClick={handleSubmitExam}
              disabled={submittingExam}
            >
              {submittingExam ? (
                <>
                  <div
                    className={styles.miniSpinner}
                    style={{ marginRight: "8px" }}
                  ></div>
                  מגיש מבחן...
                </>
              ) : (
                <>
                  <FiSave />
                  הגש מבחן
                </>
              )}
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={styles.navigationButtons}>
          <button
            className={`${styles.navButton} ${
              isFirstQuestion ? styles.disabled : ""
            }`}
            onClick={handlePreviousQuestion}
            disabled={isFirstQuestion}
          >
            שאלה קודמת
          </button>

          <button
            className={`${styles.navButton} ${
              isLastQuestion ? styles.disabled : ""
            }`}
            onClick={handleNextQuestion}
            disabled={isLastQuestion}
          >
            שאלה הבאה
          </button>
        </div>

        {/* Results */}
        {examCompleted && showResults && (
          <div className={styles.resultsContainer}>
            <div className={styles.resultsHeader}>
              <h2>תוצאות המבחן</h2>
              <div className={styles.finalScore}>
                ציון סופי: {examStats.finalScore}%
              </div>
            </div>

            <div className={styles.resultsSummary}>
              <div className={styles.resultStat}>
                <span>שאלות נכונות:</span>
                <span className={styles.correctCount}>
                  {examStats.correctAnswers}
                </span>
              </div>
              <div className={styles.resultStat}>
                <span>סה"כ שאלות:</span>
                <span>{examStats.totalQuestions}</span>
              </div>
              <div className={styles.resultStat}>
                <span>זמן שהושקע:</span>
                <span>
                  {formatTime(
                    EXAM_DURATION_MINUTES * 60 - examStats.timeRemaining
                  )}
                </span>
              </div>
            </div>

            <div className={styles.resultActions}>
              <button
                onClick={handleBackToDashboard}
                className={styles.backToDashboardButton}
              >
                חזור לדף הבית
              </button>
              <button
                onClick={handleRetakeExam}
                className={styles.retakeButton}
              >
                מבחן חוזר
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
