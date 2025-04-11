import React, { useEffect, useState } from "react";

const redColor = "#e63946";

function Slide({ socket, questions, onFinish }) {
    const [current, setCurrent] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isWrong, setIsWrong] = useState(false);

    useEffect(() => {
        setStartTime(Date.now());
        setSelectedIndex(null);
        setIsWrong(false);
    }, [current]);

    if (!questions || questions.length === 0) {
        return <div>Loading questions...</div>;
    }

    const playSound = (name) => {
        const audio = new Audio(`/sound/${name}.mp3`);
        audio.play().catch(() => { });
    };

    const answerQuestion = (idx) => {
        if (selectedIndex !== null) return;

        const timeTaken = (Date.now() - startTime) / 1000;
        const isCorrect = idx === questions[current].correctIndex;

        setSelectedIndex(idx);
        socket.emit("answer_question", { isCorrect, timeTaken });

        if (isCorrect) {
            setTimeout(() => advance(), 0);
        } else {
            setIsWrong(true);
            playSound("fail");
            setTimeout(() => advance(), 3000);
        }
    };

    const advance = () => {
        if (current < questions.length - 1) {
            setCurrent(current + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div className="margin-center" style={{ width: "70%" }}>
            <div className="card-container mb20">
                <h2>{questions[current].question}</h2>
            </div>
            <div className="options-grid">
                {questions[current].options.map((option, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isIncorrect = isSelected && isWrong;
                    const isCorrectAnswer = idx === questions[current].correctIndex;

                    const showAsCorrect = selectedIndex !== null && isCorrectAnswer;

                    const shouldFade =
                        selectedIndex !== null &&
                        !isIncorrect &&
                        !showAsCorrect;

                    const className = `option-button ${isIncorrect ? "wrong" : showAsCorrect ? "correct" : ""
                        } ${shouldFade ? "no-click" : ""}`;


                    return (
                        <button
                            key={idx}
                            onClick={() => answerQuestion(idx)}
                            className={className}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default Slide;
