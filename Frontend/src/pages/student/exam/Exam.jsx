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

  // Server URL for images
  const SERVER_URL = "http://localhost:5000";

  // Exam duration in minutes
  const EXAM_DURATION_MINUTES = 60;
  const MAX_QUESTIONS = 12;

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchExamData();
  }, [user, navigate]);

  useEffect(() => {
    if (examStats.startTime && !examCompleted) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - examStats.startTime) / 1000);
        const remaining = EXAM_DURATION_MINUTES * 60 - elapsed;

        if (remaining <= 0) {
          // Time's up! Auto-submit exam
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

  /**
   * Fetches exam data from the server and sets the state.
   * Exam data includes a shuffled list of exercises (limited to MAX_QUESTIONS),
   * total questions, answered questions, time remaining, and start time.
   */
  const fetchExamData = async () => {
    try {
      setLoading(true);

      // Fetch all practice exercises from all topics
      const response = await fetch(
        `${SERVER_URL}/api/practice/practiceExercises`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam data");
      }

      const allExercises = await response.json();

      // Shuffle the exercises and limit to MAX_QUESTIONS
      const shuffledExercises = shuffleArray([...allExercises]).slice(
        0,
        MAX_QUESTIONS
      );

      setExercises(shuffledExercises);
      setExamStats({
        totalQuestions: shuffledExercises.length,
        answeredQuestions: 0,
        timeRemaining: EXAM_DURATION_MINUTES * 60,
        startTime: new Date().getTime(),
      });
    } catch (err) {
      console.error("Error fetching exam data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fisher-Yates shuffle algorithm for randomizing questions
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /**
   * Handles when a user selects an answer for a question
   * @param {String} answer The selected answer
   */
  const handleAnswerSelect = (answer) => {
    const questionId = exercises[currentExerciseIndex].ExerciseID;
    const newAnswers = { ...selectedAnswers, [questionId]: answer };
    setSelectedAnswers(newAnswers);

    // Update answered questions count
    const answeredCount = Object.keys(newAnswers).length;
    setExamStats((prev) => ({
      ...prev,
      answeredQuestions: answeredCount,
    }));
  };

  /**
   * Handles user's action of navigating to the next question.
   * Does nothing if the user is already on the last question.
   */
  const handleNextQuestion = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  /**
   * Handles user's action of navigating to the previous question.
   * Does nothing if the user is already on the first question.
   */
  const handlePreviousQuestion = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  /**
   * Handles user's action of submitting the exam.
   * Shows a confirmation dialog, and if confirmed, calculates the results
   * and shows them. If an error occurs while saving the results, still shows
   * the results. If the user cancels the confirmation dialog, does nothing.
   */
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
        // Still show results even if save failed
        setExamCompleted(true);
        setShowResults(true);
      } finally {
        setSubmittingExam(false);
      }
    }
  };

  /**
   * Handles the event of the exam time expiring.
   * Shows an alert to the user, and then automatically submits the exam.
   * If there is an error while saving the results, still shows the results.
   */
  const handleTimeUp = async () => {
    alert("הזמן נגמר! המבחן יוגש אוטומטית.");
    try {
      await calculateResults();
      setExamCompleted(true);
      setShowResults(true);
    } catch (error) {
      console.error("Error calculating results on time up:", error);
      // Still show results even if save failed
      setExamCompleted(true);
      setShowResults(true);
    }
  };

  /**
   * Calculates the results of the exam by comparing the selected answers to the
   * correct answers, and saves the results to the database. If the save fails,
   * still shows the results. Sets the exam stats state with the final score,
   * correct answers, and results.
   *
   * @returns {Promise<void>} A promise that resolves when the results have been
   * saved, or rejects if there was an error.
   */
  const calculateResults = async () => {
    let correctAnswers = 0;
    const results = {};

    exercises.forEach((exercise) => {
      const questionId = exercise.ExerciseID;
      const selectedAnswer = selectedAnswers[questionId];

      if (selectedAnswer) {
        // Parse answer options
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

        // Get correct answer text
        let correctAnswerText = exercise.CorrectAnswer;
        if (
          ["A", "B", "C", "D", "a", "b", "c", "d"].includes(
            String(exercise.CorrectAnswer).trim()
          )
        ) {
          const letterIndex =
            String(exercise.CorrectAnswer).trim().toUpperCase().charCodeAt(0) -
            65;
          if (letterIndex >= 0 && letterIndex < answerOptions.length) {
            correctAnswerText = answerOptions[letterIndex];
          }
        }

        const isCorrect =
          String(selectedAnswer).trim() === String(correctAnswerText).trim();
        if (isCorrect) {
          correctAnswers++;
        }

        results[questionId] = {
          selected: selectedAnswer,
          correct: correctAnswerText,
          isCorrect: isCorrect,
        };
      }
    });

    const finalScore = ((correctAnswers / exercises.length) * 100).toFixed(1);

    // Save exam results and wait for completion
    const saveSuccess = await saveExamResults(finalScore, results);

    if (saveSuccess) {
      console.log(
        "Exam results saved successfully, proceeding to show results"
      );
    } else {
      console.error("Failed to save exam results, but showing results anyway");
    }

    setExamStats((prev) => ({
      ...prev,
      finalScore: finalScore,
      correctAnswers: correctAnswers,
      results: results,
    }));
  };

  /**
   * Saves the exam results to the server
   * @param {number} finalScore The final score of the exam
   * @param {Object} results The results of the exam, where each key is a question ID
   * and the value is an object with the selected answer and whether it was correct
   * @returns {Promise<boolean>} Whether the results were saved successfully
   */
  const saveExamResults = async (finalScore, results) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return false;
      }

      const userId = user?.id || user?.UserID || "1";
      const examData = {
        userId: userId,
        score: finalScore,
        answers: results,
        timeSpent: EXAM_DURATION_MINUTES * 60 - examStats.timeRemaining,
        completedAt: new Date().toISOString(),
      };

      console.log(
        "Submitting exam results to:",
        `${SERVER_URL}/api/student/exam/submit`
      );
      console.log("Exam data:", examData);

      const response = await fetch(`${SERVER_URL}/api/student/exam/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  /**
   * Navigates back to the student dashboard and dispatches a custom 'examCompleted'
   * event to notify the dashboard to refresh after an exam has been completed.
   *
   * The event is dispatched with the userId of the current user as a detail property
   * before navigating to the student dashboard after a short delay.
   *
   * @memberof Exam
   * @param {React.MouseEvent} event - The mouse event that triggered this action
   */
  const handleBackToDashboard = () => {
    console.log(
      "Exam: Navigating back to dashboard and dispatching examCompleted event"
    );

    // Trigger a custom event to notify the dashboard to refresh
    const event = new CustomEvent("examCompleted", {
      detail: { userId: user?.id || user?.UserID },
    });
    console.log(
      "Exam: Dispatching examCompleted event with userId:",
      user?.id || user?.UserID
    );
    window.dispatchEvent(event);

    // Navigate to student dashboard after a short delay to ensure event is processed
    setTimeout(() => {
      navigate("/student", { replace: true });
    }, 100);
  };

  /**
   * Handles the retake button click.
   *
   * @memberof Exam
   * @param {React.MouseEvent} event - The mouse event that triggered this action
   *
   * Prompts the user with a confirmation dialog asking if they are sure they want to
   * retake the exam. If the user confirms, reloads the page to restart the exam.
   */
  const handleRetakeExam = () => {
    if (window.confirm("האם אתה בטוח שברצונך לקחת את המבחן שוב?")) {
      window.location.reload();
    }
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${SERVER_URL}${imagePath}`;
  };

  // Format time display
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

  // Get the correct answer text
  let correctAnswerText = currentExercise.CorrectAnswer;
  if (
    ["A", "B", "C", "D", "a", "b", "c", "d"].includes(
      String(currentExercise.CorrectAnswer).trim()
    )
  ) {
    const letterIndex =
      String(currentExercise.CorrectAnswer).trim().toUpperCase().charCodeAt(0) -
      65;
    if (letterIndex >= 0 && letterIndex < answerOptions.length) {
      correctAnswerText = answerOptions[letterIndex];
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
          <p>בדוק את הידע שלך בכל הנושאים</p>
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

      {/* Question Navigation - Moved to top */}
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
                src={getImageUrl(currentExercise.ContentValue)}
                alt="Question content"
                className={styles.questionImage}
                onError={(e) => {
                  console.error(
                    "Failed to load image:",
                    currentExercise.ContentValue
                  );
                  e.target.style.display = "none";
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
                        {/* Show correct icon only for the correct answer */}
                        {examStats.results?.[currentQuestionId]?.correct ===
                          option && <FiCheck className={styles.correctIcon} />}
                        {/* Show incorrect icon only for selected wrong answer */}
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

        {/* Results Display */}
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