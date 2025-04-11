import React from 'react';
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // change to Render URL when deployed

function Admin() {
    const [players, setPlayers] = useState([]);
    const [scores, setScores] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        socket.on("player_list", setPlayers);

        socket.on("score_update", (updatedScores) => {
            setScores(updatedScores);
        });

        socket.on("game_started", () => {
            setGameStarted(true);
        });

        socket.on("game_ended", (finalScores) => {
            setScores(finalScores);
            setGameEnded(true);
            setWinner(finalScores[0]); // highest score is first
        });
    }, []);

    const handleStartGame = () => {
        socket.emit("start_game");
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <div className="mb20">
                <div className="card-container margin-center" style={{ width: '90%' }}>
                    <h2>אדמין</h2>
                </div>
            </div>
            {gameEnded && winner && (
                <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
                    <h3 className="text-lg font-bold text-yellow-800">🏆 Winner:</h3>
                    <p className="text-xl font-semibold">{winner.username} with {winner.score} points!</p>
                </div>
            )}

            {!gameStarted && (
                <>
                    <div className="mb20">
                        <div className="card-container margin-center mb" style={{ width: '90%' }}>
                            <h3 className="text-lg font-semibold mb-2">Players Joined:</h3>
                            <ul className="mb-4">
                                {players.map((name) => (
                                    <li key={name}>{name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={handleStartGame}
                        >
                            Start Game
                        </button>
                    </div>
                </>
            )}

            {gameStarted && (
                <>
                    <div className="card-container margin-center" style={{ width: '90%' }}>
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
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>{p.username}</td>
                                        <td>{p.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

        </div>
    );
}

export default Admin;
