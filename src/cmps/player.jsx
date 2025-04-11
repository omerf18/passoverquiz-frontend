import React from 'react';
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Slide from "./slide";

const socket = io("http://localhost:5000");

function Player() {
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);
    const [started, setStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [finished, setFinished] = useState(false);
    const [scores, setScores] = useState([]);
    const [winner, setWinner] = useState(null);
    const [myScore, setMyScore] = useState(0);

    useEffect(() => {
        socket.on("player_list", (list) => {
            // Convert usernames to score format for pre-join view
            setScores((prev) => {
                const existing = Object.fromEntries(prev.map(p => [p.username, p.score]));
                return list.map((username) => ({
                    username,
                    score: existing[username] || 0
                }));
            });
        });

        socket.on("game_started", () => {
            setStarted(true);
            playSound("start");
            socket.emit("request_questions");
        });

        socket.on("receive_questions", (data) => {
            setQuestions(data);
        });

        socket.on("score_update", (data) => {
            setScores(data);
            const me = data.find((p) => p.username === username);
            if (me) setMyScore(me.score);
        });

        socket.on("game_ended", (finalScores) => {
            setScores(finalScores);

            const me = finalScores.find((p) => p.username === username);
            if (me) setMyScore(me.score);

            const topScore = finalScores[0]?.score;
            const winningPlayers = finalScores.filter(p => p.score === topScore);

            setWinner(winningPlayers); // ← now `winner` is an array of winners

            if (me && winningPlayers.some(p => p.username === me.username)) {
                playSound("winner");
            }
        });

    }, [username]);

    const playSound = (name) => {
        const audio = new Audio(`/sound/${name}.mp3`);
        audio.play().catch(() => { });
    };

    const joinGame = () => {
        if (username.trim()) {
            socket.emit("join_game", username.trim());
            setJoined(true);
            playSound("join");
        }
    };

    const handleFinish = () => {
        setFinished(true);
    };

    return (
        <div className="">
            {/* Game Header (always visible after joining) */}

            <div
                className="header-container flex space-between"
            >
                <div className="header-title" style={{ width: '100px' }}>{username}</div>
                <div className='header-title flex align-center'>
                    פסח 2025
                </div>
                <div className="header-title flex flex-end" style={{ width: '100px' }}>{myScore}</div>
            </div>

            {/* Not joined yet – input and Join button */}
            {!joined ? (
                <>
                    <div className="margin-center flex column center-center" style={{ width: "90%" }}>

                        <div className="card-container rules mb20">
                            <h2>🎮 חוקי המשחק</h2>
                            <p>
                                <span>📝 המשחק יתחיל לאחר שכל המשתתפים ירשמו.</span><br />
                                <span>✅ כל תשובה נכונה מזכה בנקודה אחת.</span><br />
                                <span>⚡ תשובה נכונה תוך פחות מ־3 שניות מזכה בשתי נקודות.</span><br />
                                <span>⏱️ המשחק יסתיים לאחר שכל המשתתפים יענו על כל השאלות.</span><br />
                                <span>🏆 בסיום המשחק יוכרז המנצח, שייחשב כמוצא האפיקומן — והוא יקבל את הפרס מהמארחים.</span> <br />
                                <span>🤝 במקרה של תיקו, הפרס יחולק באופן שווה בין כל המנצחים.</span> <br />
                                <span>🔊 מומלץ להגביר את הסאונד לחוויה המלאה.</span>
                            </p>
                        </div>

                        <input
                            className="mb20"
                            style={{ width: '100%' }}
                            placeholder={`הקלד את שמך ולחץ "התחל"`}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <button
                            className="mb20"
                            style={{ width: '100%' }}
                            onClick={joinGame}
                        >
                            התחל
                        </button>

                        <div />

                        {/* Show joined players even before user has joined */}
                    </div>
                </>
            ) : (
                <>
                    {/* Waiting for game to start */}
                    {!started && !finished && (
                        <div className="margin-center" style={{ width: "90%" }}>
                            <div className="card-container mb20">
                                מחכים לסבתא וסבא..
                            </div>
                            <div style={{ minHeight: '50vh' }} className="card-container" >
                                <h3 className="flex center-center">רשימת משתתפים</h3>
                                {
                                    scores && scores.length > 0 ? (
                                        <ul className='mt20'>
                                            {scores.slice().reverse().map((p) => (
                                                <li key={p.username}>{p.username}</li>
                                            ))}
                                        </ul>
                                    ) : null
                                }
                            </div>
                        </div>
                    )}

                    {/* Game in progress */}
                    {started && !finished && questions.length > 0 && (
                        <Slide socket={socket} questions={questions} onFinish={handleFinish} />
                    )}

                    {/* Game completed */}
                    {finished && (
                        <div className="margin-center" style={{ width: "90%" }}>
                            {winner && winner.length > 0 && (
                                <div className="card-container mb20">
                                    <h3 className="">
                                        🏆 {winner.length > 1 ? 'המנצחים' : 'המנצח'}:
                                    </h3>
                                    <p className="font-semibold">
                                        {winner.map(p => p.username).join(', ')} עם {winner[0].score} נקודות!
                                    </p>
                                </div>
                            )}

                            <div className="card-container">
                                <h3 className="title flex center-center">לוח תוצאות</h3>

                                <table className="score-table">
                                    <thead>
                                        <tr>
                                            <th>מקום</th>
                                            <th>שם</th>
                                            <th>נקודות</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scores.map((p, index) => (
                                            <tr key={p.username} className={p.username === username ? "font-semibold" : ""}>
                                                <td>{index + 1}</td>
                                                <td>{p.username}</td>
                                                <td>{p.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Player;
