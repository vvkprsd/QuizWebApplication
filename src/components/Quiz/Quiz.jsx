import React, { useState } from 'react';
import { resultInitialState } from '../../assets/constants';
import './Quiz.scss';
import AnswerTimer from '../AnswerTimer/AnswerTimer';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring assignment
    }
    return array;
}

function shuffleQuestionsAndOptions(questions) {
    // First, shuffle the array of questions
    let shuffledQuestions = shuffleArray([...questions]);

    // Now, shuffle the choices within each question
    shuffledQuestions = shuffledQuestions.map(question => ({
        ...question,
        choices: shuffleArray([...question.choices])
    }));

    return shuffledQuestions;
}

const Quiz = ({ questions }) => {
    const [shuffledQuestions, setShuffledQuestions] = useState(() => shuffleQuestionsAndOptions(questions));
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answerIdx, setAnswerIdx] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [result, setResult] = useState(resultInitialState);
    const [showResult, setShowResult] = useState(false);
    const [showAnswerTimer, setShowAnswerTimer] = useState(true);
    const [answeredQuestions, setAnsweredQuestions] = useState([]);

    const { question, choices, correctAnswer } = shuffledQuestions[currentQuestion];

    const onAnswerClick = (answer, index) => {
        setAnswerIdx(index);
        if (answer === correctAnswer) {
            setAnswer(true);
        } else {
            setAnswer(false);
        }
    };

    const onClickNext = (finalAnswer, timerRanOut = false) => {
        setAnswerIdx(null);
        setShowAnswerTimer(false);
        setResult((prev) =>
            finalAnswer
                ? { ...prev, score: prev.score + 5, correctAnswers: prev.correctAnswers + 1 }
                : { ...prev, wrongAnswers: prev.wrongAnswers + 1 }
        );

        if (!finalAnswer || timerRanOut) {
            setAnsweredQuestions((prev) => [
                ...prev,
                {
                    question: shuffledQuestions[currentQuestion].question,
                    userAnswer: answerIdx !== null ? choices[answerIdx] : "No answer",
                    correctAnswer: shuffledQuestions[currentQuestion].correctAnswer,
                    isCorrect: finalAnswer,
                },
            ]);
        }

        if (currentQuestion < shuffledQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setCurrentQuestion(0);
            setShowResult(true);
        }

        setTimeout(() => {
            setShowAnswerTimer(true);
        }, 500);  // Adding a slight delay before showing the timer again
    };

    const onTryAgain = () => {
        setShuffledQuestions(shuffleQuestionsAndOptions(questions));
        setCurrentQuestion(0);
        setResult(resultInitialState);
        setShowResult(false);
        setShowAnswerTimer(true);
        setAnsweredQuestions([]);
    };

    const handleTimeUp = () => {
        setAnswer(false);
        onClickNext(false, true); // Pass an additional argument to indicate timer ran out
    };

    return (
        <div className="quiz-container">
            {!showResult ? (
                <>
                    {showAnswerTimer && <AnswerTimer duration={45} onTimeUp={handleTimeUp} />}
                    <span className="active-question-no">{currentQuestion + 1}</span>
                    <span className="total-questions">/{shuffledQuestions.length}</span>
                    <h2>{question}</h2>

                    <ul>
                        {choices.map((answer, index) => (
                            <li
                                onClick={() => onAnswerClick(answer, index)}
                                key={answer}
                                className={answerIdx === index ? "selected-answer" : null}
                            >
                                {answer}
                            </li>
                        ))}
                    </ul>

                    <div className="footer">
                        <button onClick={() => onClickNext(answer)} disabled={answerIdx === null}>
                            {currentQuestion === shuffledQuestions.length - 1 ? "Finish" : "Next"}
                        </button>
                    </div>
                </>
            ) : (
                <div className="result">
                    <h3>Results</h3>
                    <p>
                        Correct Answers: <span>{result.correctAnswers}</span>
                    </p>
                    

                    {result.wrongAnswers > 0 && (
                        <>
                            <h4>Wrong Answers Review:</h4>
                            <ul>
                                {answeredQuestions.filter((aq) => !aq.isCorrect).map((aq, index) => (
                                    <li key={index}>
                                        <div className="question">
                                            Question: <span>{aq.question}</span>
                                        </div>
                                        <div className="your-answer">
                                            Your Answer: <span>{aq.userAnswer}</span>
                                        </div>
                                        <div className="correct-answer">
                                            Correct Answer: <span>{aq.correctAnswer}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <button onClick={onTryAgain}>Try Again</button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
