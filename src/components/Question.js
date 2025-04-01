import { useState } from "react";
import questionsData from "../questions.json";

const shuffledQuestions = questionsData.sort(() => Math.random() - 0.5);

function Question({ socket }) {
  const [current, setCurrent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const answerQuestion = (idx) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = idx === shuffledQuestions[current].correctIndex;

    socket.emit("answer_question", { isCorrect, timeTaken });

    if (current < shuffledQuestions.length - 1) {
      setCurrent(current + 1);
      setStartTime(Date.now());
    } else {
      alert("Finished!");
    }
  };

  return (
    <div>
      <h2>{shuffledQuestions[current].question}</h2>
      {shuffledQuestions[current].options.map((option, idx) => (
        <button key={idx} onClick={() => answerQuestion(idx)}>
          {option}
        </button>
      ))}
    </div>
  );
}

export default Question;