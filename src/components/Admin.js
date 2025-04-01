import { useEffect, useState } from "react";
import io from "socket.io-client";
const socket = io("http://localhost:5000");

function Admin() {
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    socket.on("player_list", setPlayers);
    socket.on("score_update", setScores);
    socket.on("game_ended", (finalScores) => {
      setScores(finalScores);
      alert(`Winner: ${finalScores[0].username}`);
    });
  }, []);

  return (
    <div>
      <button onClick={() => socket.emit("start_game")}>Start Game</button>
      <h3>Players:</h3>
      {players.map((name) => <div key={name}>{name}</div>)}
      <h3>Scores:</h3>
      {scores.map((player) => (
        <div key={player.username}>{player.username}: {player.score}</div>
      ))}
    </div>
  );
}

export default Admin;