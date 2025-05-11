import styles from "./practice.module.css";
import { useState, useEffect } from "react";

/**
 * The Practice component renders a practice question interface for students.
 * It displays a question with an image and multiple choice options. Students
 * can select an answer and proceed to the next question using the "Next" button.
 * The component manages the state of the current question, including its ID,
 * image URL, selected answer, and available options.
 *
 * @returns {JSX.Element} The rendered Practice component with a question image,
 * options list, and a next button.
 */

export default function Practice() {
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 1,
    img: "https://picsum.photos/200/300",
    answer: "",
    options: ["a", "b", "c", "d"]
  });

  const handleAnswerChange = (answer) => {
    setCurrentQuestion({ ...currentQuestion, answer });
  };

  const handleNextQuestion = () => {
    // Logic to load the next question
    setCurrentQuestion({
      id: currentQuestion.id + 1,
      img: "https://picsum.photos/200/302?random=" + (currentQuestion.id + 1),
      answer: "",
      options: ["a", "b", "c", "d"]
    });
  };

  return (
    <div className={styles.practicePage}>
      <h1>Practice</h1>
      <div className={styles.question}>
        <img src={currentQuestion.img} alt={`question ${currentQuestion.id}`} />
        <ul className={styles.optionsList}>
          {currentQuestion.options.map((option) => (
            <li key={option}>
              <input
                type="radio"
                name="answer"
                value={option}
                checked={currentQuestion.answer === option}
                onChange={() => handleAnswerChange(option)}
              />
              <label>{option}</label>
            </li>
          ))}
        </ul>
        <button onClick={handleNextQuestion} className={styles.nextButton}>
          Next
        </button>
      </div>
    </div>
  );
}

