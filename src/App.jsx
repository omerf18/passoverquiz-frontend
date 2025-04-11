import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Player from "./cmps/player";
import Admin from "./cmps/admin";

function App() {
  return (
    <div className="background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Player />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
