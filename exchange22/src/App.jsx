import "./App.css";
import Home from "./pages/Home.jsx";

//pages
import Playerdetails from "./pages/playerdetails.jsx";
import { Route, Routes } from "react-router-dom";
import Navbar from "./pages/navbar.jsx";

import Predictbatsman from "./pages/Predictbatsman.jsx";
import Predictbowler from "./pages/Predictbowler.jsx";
import Predictallrounder from "./pages/Predictallrounder.jsx";
import Add from "./pages/Add.jsx";

import Scraper from "./pages/scraper.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Add />} />
        <Route path="/home" element={<Home playerId="1413" />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/Playerdetails" element={<Playerdetails />} />

        <Route path="/batsman" element={<Predictbatsman />} />
        <Route path="/bowler" element={<Predictbowler />} />
        <Route path="/allrounder" element={<Predictallrounder />} />

        <Route path="/scraper" element={<Scraper />} />
      </Routes>
    </>
  );
}

export default App;
