// Frontend/src/pages/student/practice/practice questions/Practice.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiBook } from "react-icons/fi";
import styles from "./practice.module.css"; // Using dedicated CSS for this component

/**
 * Practice component for student to practice all topics
 * @param {boolean} [loading] - Whether to display loading animation
 * @param {string} [error] - Error message to display if practice data failed to load
 * @returns {JSX.Element} - Practice component
 */
export default function Practice() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [practiceStats, setPracticeStats] = useState({
    totalQuestions: 0,
    currentTopic: null,
    topicProgress: {},
  });

  // Server URL for images
  const SERVER_URL = "http://localhost:5000";

  useEffect(() => {
    fetchAllPracticeData();
  }, []);

  /**
   * Fetches all practice exercises from all topics from the server and sets the state.
   * It also shuffles the exercises for random practice and sets the initial topic.
   * If the request fails, it sets the error state with the error message.
   * @returns {void}
   */
  const fetchAllPracticeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all practice exercises from all topics
      const response = await fetch(
        `${SERVER_URL}/api/practice/practiceExercises`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch practice data");
      }

      const allExercises = await response.json();

      // Shuffle the exercises for random practice
      const shuffledExercises = shuffleArray([...allExercises]);

      setExercises(shuffledExercises);
      setPracticeStats({
        totalQuestions: shuffledExercises.length,
        currentTopic: shuffledExercises[0]?.TopicID || null,
        topicProgress: {},
      });
    } catch (err) {
      console.error("Error fetching practice data:", err);
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

    // Check if CorrectAnswer is a letter (A, B, C, D) and convert to actual answer text
    let correctAnswerText = currentExercise.CorrectAnswer;
    if (
      ["A", "B", "C", "D", "a", "b", "c", "d"].includes(
        String(currentExercise.CorrectAnswer).trim()
      )
    ) {
      const letterIndex =
        String(currentExercise.CorrectAnswer)
          .trim()
          .toUpperCase()
          .charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
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
    const correctAnswerStr = String(correctAnswerText).trim();

    const isCorrect = selectedAnswerStr === correctAnswerStr;

    console.log("String comparison:");
    console.log("  Selected (trimmed):", `"${selectedAnswerStr}"`);
    console.log("  Correct (trimmed):", `"${correctAnswerStr}"`);
    console.log("  Is Correct:", isCorrect);
    console.log("================================");

    if (isCorrect) {
      setScore(score + 1);

      // Update topic progress
      const topicId = currentExercise.TopicID;
      setPracticeStats((prev) => ({
        ...prev,
        topicProgress: {
          ...prev.topicProgress,
          [topicId]: (prev.topicProgress[topicId] || 0) + 1,
        },
      }));
    }

    setShowResult(true);
  };

  /**
   * Navigates to the next exercise in the practice session if there is one.
   * Resets selected answer and result visibility.
   * Updates current topic in practice stats state.
   */
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);

      // Update current topic
      const nextExercise = exercises[currentExerciseIndex + 1];
      setPracticeStats((prev) => ({
        ...prev,
        currentTopic: nextExercise?.TopicID || null,
      }));
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
    console.log("Practice completed! Final score:", finalScore);
    console.log("Topic progress:", practiceStats.topicProgress);

    // Navigate back to practice dashboard
    navigate("/student");
  };

  /**
   * Navigates back to the student dashboard.
   * @returns {void}
   */
  const handleBackToDashboard = () => {
    navigate("/student");
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
          <p>טוען תרגילים מכל הנושאים...</p>
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
          <h2>אין תרגילים זמינים</h2>
          <p>לא נמצאו תרגילים לתרגול</p>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            <FiArrowLeft />
            חזור לדשבורד
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
  if (
    ["A", "B", "C", "D", "a", "b", "c", "d"].includes(
      String(currentExercise.CorrectAnswer).trim()
    )
  ) {
    const letterIndex =
      String(currentExercise.CorrectAnswer).trim().toUpperCase().charCodeAt(0) -
      65; // A=0, B=1, C=2, D=3
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
    TopicID: currentExercise.TopicID,
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
          <h1>תרגול כללי - כל הנושאים</h1>
          
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

            <div className={styles.answerOptionsGrid}>
              {answerOptions.map((option, index) => {
                // Get the correct answer text (handle both letter and text formats)
                let correctAnswerText = currentExercise.CorrectAnswer;
                if (
                  ["A", "B", "C", "D", "a", "b", "c", "d"].includes(
                    String(currentExercise.CorrectAnswer).trim()
                  )
                ) {
                  const letterIndex =
                    String(currentExercise.CorrectAnswer)
                      .trim()
                      .toUpperCase()
                      .charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                  if (letterIndex >= 0 && letterIndex < answerOptions.length) {
                    correctAnswerText = answerOptions[letterIndex];
                  }
                }

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