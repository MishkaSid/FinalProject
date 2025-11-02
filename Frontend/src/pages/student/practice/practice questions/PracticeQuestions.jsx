// בקובץ זה נמצא דף התרגול עבור נושא ספציפי
// הקובץ מספק ממשק תרגול אינטראקטיבי עם שאלות ותשובות מידיות
// הוא מאפשר לסטודנטים לתרגל נושא מסוים ולקבל משוב מיידי על התשובות
// Frontend/src/pages/student/practice/practice questions/PracticeQuestions.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiPlay } from "react-icons/fi";
import styles from "./practiceQuestions.module.css";

/**
 * PracticeQuestions component for student to practice questions of a topic
 * @param {object} [topicData] - Topic data from server
 * @param {array} [exercises] - Exercises array from server
 * @param {number} [currentExerciseIndex] - Current exercise index
 * @param {string} [selectedAnswer] - Selected answer by user
 * @param {boolean} [showResult] - Whether to show result of previous exercise
 * @param {number} [score] - Score of the practice
 * @param {boolean} [loading] - Whether to display loading animation
 * @param {string} [error] - Error message to display if practice data failed to load
 * @returns {JSX.Element} - PracticeQuestions component
 */
export default function PracticeQuestions() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topicData, setTopicData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  // Server URL for images
  const SERVER_URL = "http://localhost:5000";

  // Get difficulty from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const levelParam = urlParams.get('level');
    if (levelParam && ['easy', 'medium', 'exam'].includes(levelParam)) {
      setDifficulty(levelParam);
    } else {
      setDifficulty(null); // No filter - show all difficulties
    }
  }, []);

  useEffect(() => {
    fetchPracticeData();
  }, [topicId, difficulty]); // Refetch when topicId OR difficulty changes

  /**
   * Fetches practice data from the server and sets the state.
   * It fetches the topic data and exercises from the server.
   * If the request fails, it sets the error state with the error message.
   * @returns {void}
   */
  const fetchPracticeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Redirect to login if no token
        navigate('/');
        throw new Error("No authentication token found. Redirecting to login.");
      }

      // Fetch topic data
      const topicResponse = await fetch(
        `${SERVER_URL}/api/student/practice/topic/${topicId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!topicResponse.ok) {
        if (topicResponse.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          throw new Error("Authentication failed. Redirecting to login.");
        }
        throw new Error(`Failed to fetch topic data: ${topicResponse.status}`);
      }

      const topicData = await topicResponse.json();
      setTopicData(topicData.topic);

      // Fetch exercises with optional difficulty filter
      const difficultyParam = difficulty ? `?difficulty=${difficulty}` : '';
      const exercisesResponse = await fetch(
        `${SERVER_URL}/api/student/practice/exercises/${topicId}${difficultyParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!exercisesResponse.ok) {
        if (exercisesResponse.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          throw new Error("Authentication failed. Redirecting to login.");
        }
        throw new Error(`Failed to fetch exercises: ${exercisesResponse.status}`);
      }

      const exercises = await exercisesResponse.json();
      setExercises(exercises);
      
      // Reset practice state when exercises change
      setCurrentExerciseIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
    } catch (err) {
      console.error("Error fetching practice data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sets the selected answer for the current exercise.
   * @param {string} answer
   * @returns {void}
   */
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  /**
   * Handles submitting an answer for the current exercise.
   * It compares the selected answer to the correct answer, and
   * updates the score and topic progress if the answer is correct.
   * @returns {void}
   */

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const currentExercise = exercises[currentExerciseIndex];

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

    // Debug logging to see what we're comparing
    console.log("=== ANSWER SUBMISSION DEBUG ===");
    console.log("Selected Answer:", selectedAnswer);
    console.log("Correct Answer:", currentExercise.CorrectAnswer);
    console.log("Answer Options:", answerOptions);
    console.log(
      "Types - Selected:",
      typeof selectedAnswer,
      "Correct:",
      typeof currentExercise.CorrectAnswer
    );

    // Check if CorrectAnswer is a letter (A, B, C, D, E, F, etc.) and convert to actual answer text
    let correctAnswerText = currentExercise.CorrectAnswer;
    const correctAnswerStr = String(currentExercise.CorrectAnswer).trim();
    // Check if it's a single letter (A-Z)
    if (correctAnswerStr.length === 1 && /^[A-Za-z]$/.test(correctAnswerStr)) {
      const letterIndex =
        correctAnswerStr.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3, E=4, etc.
      if (letterIndex >= 0 && letterIndex < answerOptions.length) {
        correctAnswerText = answerOptions[letterIndex];
        console.log(
          "Converted letter to answer text:",
          currentExercise.CorrectAnswer,
          "->",
          correctAnswerText
        );
      }
    }

    // Ensure both values are strings for comparison
    const selectedAnswerStr = String(selectedAnswer).trim();
    const correctAnswerStrFinal = String(correctAnswerText).trim();

    const isCorrect = selectedAnswerStr === correctAnswerStrFinal;

    console.log("String comparison:");
    console.log("  Selected (trimmed):", `"${selectedAnswerStr}"`);
    console.log("  Correct (trimmed):", `"${correctAnswerStrFinal}"`);
    console.log("  Is Correct:", isCorrect);
    console.log("================================");

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  /**
   * Handles user's action of navigating to the next exercise.
   * Does nothing if the user is already on the last exercise.
   * Resets the selected answer and shows the result of the previous exercise.
   * @returns {void}
   */
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  /**
   * Finishes the practice session and navigates back to the practice dashboard.
   * Calculates the final score as a percentage of correct answers out of total questions.
   * Logs the final score and topic progress to the console.
   * @returns {void}
   */
  const handleFinishPractice = () => {
    const finalScore = ((score / exercises.length) * 100).toFixed(1);
    // You can save the practice results here if needed
    navigate(`/student/practice-dashboard/${topicId}?score=${finalScore}`);
  };


  /**
   * Navigates back to the student dashboard if topicId is not defined, otherwise
   * navigates to the practice dashboard for the current topic.
   * @returns {void}
   */
  const handleBackToDashboard = () => {
    if (!topicId) {
      navigate(`/student`);
    }
    navigate(`/student/practice-dashboard/${topicId}`);
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath;
    // If it's a relative path, add server URL
    return `${SERVER_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען תרגילים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>שגיאה בטעינת התרגילים</h2>
          <p>{error}</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור
          </button>
        </div>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noExercisesContainer}>
          <h2>אין תרגילים זמינים</h2>
          <p>לא נמצאו תרגילים עבור נושא זה</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

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

  // Get the correct answer text (handle both letter and text formats)
  let correctAnswerText = currentExercise.CorrectAnswer;
  const correctAnswerStr = String(currentExercise.CorrectAnswer).trim();
  // Check if it's a single letter (A-Z)
  if (correctAnswerStr.length === 1 && /^[A-Za-z]$/.test(correctAnswerStr)) {
    const letterIndex =
      correctAnswerStr.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3, E=4, etc.
    if (letterIndex >= 0 && letterIndex < answerOptions.length) {
      correctAnswerText = answerOptions[letterIndex];
      console.log(
        "Correct answer conversion:",
        currentExercise.CorrectAnswer,
        "->",
        correctAnswerText
      );
    }
  }

  // Debug: Log the current exercise data
  console.log("Current Exercise Data:", {
    ContentType: currentExercise.ContentType,
    ContentValue: currentExercise.ContentValue,
    AnswerOptions: currentExercise.AnswerOptions,
    CorrectAnswer: currentExercise.CorrectAnswer,
    CorrectAnswerText: correctAnswerText,
    ParsedAnswerOptions: answerOptions,
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBackToDashboard} className={styles.backButton}>
          <FiArrowLeft />
          חזור לדשבורד
        </button>
        <div className={styles.headerInfo}>
          <h1>{topicData?.name}</h1>
          <h3 className={styles.difficultyTitle}>
          רמת קושי: {difficulty === 'easy' ? 'קל' : difficulty === 'medium' ? 'בינוני' : 'מבחן'}
        </h3>
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

      {/* Exercise Content */}
      <div className={styles.exerciseContainer}>
        <div className={styles.exerciseHeader}>
          <h2>שאלה {currentExerciseIndex + 1}</h2>
          <div className={styles.scoreDisplay}>
            ציון: {score}/{currentExerciseIndex + 1}
          </div>
        </div>

        <div className={styles.exerciseContent}>
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
                // Use consistent comparison method for all checks
                const isCorrectAnswer =
                  String(option).trim() === String(correctAnswerText).trim();
                const isSelectedAnswer = selectedAnswer === option;
                const isIncorrectSelected =
                  showResult && isSelectedAnswer && !isCorrectAnswer;

                // Debug logging for visual feedback
                if (showResult) {
                  console.log(`Option ${index + 1} (${option}):`, {
                    isCorrectAnswer,
                    isSelectedAnswer,
                    isIncorrectSelected,
                    optionValue: `"${option}"`,
                    correctValue: `"${currentExercise.CorrectAnswer}"`,
                    correctAnswerText: `"${correctAnswerText}"`,
                  });
                }

                return (
                  <button
                    key={index}
                    className={`${styles.answerOption} ${
                      isSelectedAnswer ? styles.selected : ""
                    } ${
                      showResult && isCorrectAnswer
                        ? styles.correct
                        : isIncorrectSelected
                        ? styles.incorrect
                        : ""
                    }`}
                    onClick={() => !showResult && handleAnswerSelect(option)}
                    disabled={showResult}
                  >
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className={styles.optionText}>{option}</span>
                    {showResult && isCorrectAnswer && (
                      <FiCheck className={styles.correctIcon} />
                    )}
                    {isIncorrectSelected && (
                      <FiX className={styles.incorrectIcon} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {!showResult ? (
            <button
              className={`${styles.submitButton} ${
                selectedAnswer ? styles.active : styles.disabled
              }`}
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              שלח תשובה
            </button>
          ) : (
            <div className={styles.resultButtons}>
              {isLastExercise ? (
                <button
                  className={styles.finishButton}
                  onClick={handleFinishPractice}
                >
                  סיים תרגול
                </button>
              ) : (
                <button
                  className={styles.nextButton}
                  onClick={handleNextExercise}
                >
                  שאלה הבאה
                </button>
              )}
            </div>
          )}
        </div>

        {/* Result Display */}
        {showResult && (
          <div className={styles.resultDisplay}>
            <div
              className={`${styles.resultMessage} ${
                String(selectedAnswer).trim() ===
                String(correctAnswerText).trim()
                  ? styles.correctMessage
                  : styles.incorrectMessage
              }`}
            >
              {String(selectedAnswer).trim() ===
              String(correctAnswerText).trim() ? (
                <>
                  <FiCheck />
                  תשובה נכונה!
                </>
              ) : (
                <>
                  <FiX />
                  תשובה שגויה. התשובה הנכונה היא: {correctAnswerText}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}