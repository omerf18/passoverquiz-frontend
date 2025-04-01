import { useEffect, useState } from "react";
import io from "socket.io-client";
import Question from "./Question";
const socket = io("http://localhost:5000");

function Player() {
  const [username, setUsername] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    socket.on("game_started", () => setStarted(true));
  }, []);

  const joinGame = () => socket.emit("join_game", username);

  return (
    <div>
      {!started ? (
        <>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
          <button onClick={joinGame}>Join Game</button>
        </>
      ) : <Question socket={socket} />}
    </div>
  );
}

export default Player;