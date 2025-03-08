import React, { useEffect, useState } from "react";
import Navbar from "./navbar";

function Scraper() {
  const [batting, setBatting] = useState([]);
  const [bowling, setBowling] = useState([]);
  const [batting_bowling, setbatting_bowling] = useState([]);
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const [match, setMatch] = useState([]);
  const [options, setOptions] = useState({});
  const [storedUrl, setUrl] = useState("");
  const [load, setload] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/data")
      .then((response) => response.json())
      .then((data) => {
        setOptions(data.options);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  useEffect(() => {
    if (category && format) {
      get_catgory_format(category, format);
    }
  }, [category, format]);

  useEffect(() => {
    if (category && format && match) {
      getscraper();
    }
  }, [match, load]);

  const cleanName = (name) => name.trim(); // Only trim spaces, no case change

  const modifyPlayerNames = (players, databasePlayers) => {
    return players.map((player) => {
      const playerName = cleanName(player.name);

      const matchedPlayer = databasePlayers.find((dbPlayer) => {
        const dbPlayerName = cleanName(dbPlayer.player_name);

        return (
          playerName.startsWith(dbPlayerName) ||
          dbPlayerName.startsWith(playerName) ||
          playerName.endsWith(dbPlayerName) ||
          dbPlayerName.endsWith(playerName)
        );
      });

      return matchedPlayer
        ? { ...player, name: matchedPlayer.player_name } // Replace with DB name
        : player;
    });
  };

  const getscraper = async () => {
    try {
      const response = await fetch("http://localhost:5000/cricket");
      const jsonData = await response.json();

      if (!match) {
        console.log("Error: Match data is empty or undefined.");
        return;
      }

      // Modify names for all three categories
      const modifiedBatting = modifyPlayerNames(jsonData.batting, match);
      const modifiedBowling = modifyPlayerNames(jsonData.bowling, match);
      const modifiedBattingBowling = modifyPlayerNames(
        jsonData.batting_bowling,
        match
      );

      console.log("Updated Batting:", modifiedBatting);
      console.log("Updated Bowling:", modifiedBowling);
      console.log("Updated Batting & Bowling:", modifiedBattingBowling);

      setBatting(modifiedBatting);
      setBowling(modifiedBowling);
      setbatting_bowling(modifiedBattingBowling);
    } catch (error) {
      console.log("Error fetching cricket data:", error);
    }
  };

  const get_catgory_format = async (selectedCategory, selectedFormat) => {
    try {
      const response = await fetch("http://localhost:5000/matchcatformat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          format: selectedFormat,
        }),
      });

      const jsonData = await response.json();
      setMatch(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setFormat("");
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const allFieldsSelected = category && format;
  const handleSubmit = async () => {
    try {
      // **Categorizing Batting Players**
      const unmatchedBattingPlayers = batting.filter(
        (player) => !match.some((m) => m.player_name === player.name)
      );

      const matchedBattingPlayers = batting
        .filter((player) => match.some((m) => m.player_name === player.name))
        .map((player) => ({
          player_id: match.find((m) => m.player_name === player.name)
            ?.player_id,
          run: player.run,
          strikerate: player.strikerate,
        }));

      // **Categorizing Bowling Players**
      const unmatchedBowlingPlayers = bowling.filter(
        (player) => !match.some((m) => m.player_name === player.name)
      );

      const matchedBowlingPlayers = bowling
        .filter((player) => match.some((m) => m.player_name === player.name))
        .map((player) => ({
          player_id: match.find((m) => m.player_name === player.name)
            ?.player_id,
          name: player.name,
          wicket: player.wicket,
          economy: player.economy,
        }));

      // **Categorizing Batting_Bowling Players**
      const unmatchedBattingBowlingPlayers = batting_bowling.filter(
        (player) => !match.some((m) => m.player_name === player.name)
      );

      const matchedBattingBowlingPlayers = batting_bowling
        .filter((player) => match.some((m) => m.player_name === player.name))
        .map((player) => ({
          player_id: match.find((m) => m.player_name === player.name)
            ?.player_id,
          run: player.run,
          strikerate: player.strikerate,
          wicket: player.wicket,
          economy: player.economy,
        }));

      // **Making API Calls**
      const requests = [];

      if (unmatchedBattingPlayers.length > 0) {
        requests.push(
          fetch("http://localhost:5000/insertUnmatchedBatting", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category,
              format,
              unmatchedPlayers: unmatchedBattingPlayers,
            }),
          })
        );
      }

      if (matchedBattingPlayers.length > 0) {
        requests.push(
          fetch("http://localhost:5000/updateMatchedBatting", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matchedPlayers: matchedBattingPlayers }),
          })
        );
      }

      if (unmatchedBowlingPlayers.length > 0) {
        requests.push(
          fetch("http://localhost:5000/insertUnmatchedBowling", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category,
              format,
              unmatchedPlayers: unmatchedBowlingPlayers,
            }),
          })
        );
      }

      if (matchedBowlingPlayers.length > 0) {
        requests.push(
          fetch("http://localhost:5000/updateMatchedBowling", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matchedPlayers: matchedBowlingPlayers }),
          })
        );
      }

      if (unmatchedBattingBowlingPlayers.length > 0) {
        requests.push(
          fetch("http://localhost:5000/insertUnmatchedBatting_Bowling", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category,
              format,
              unmatchedPlayers: unmatchedBattingBowlingPlayers,
            }),
          })
        );
      }

      if (matchedBattingBowlingPlayers.length > 0) {
        requests.push(
          fetch("http://localhost:5000/updateMatchedBatting_Bowling", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              matchedPlayers: matchedBattingBowlingPlayers,
            }),
          })
        );
      }

      await Promise.all(requests);
      alert("Players processed successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process players.");
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storedUrl }),
      });
      const result = await response.json(); // Just ensuring the request is completed
      setload(result);
      alert(`Submitted URL: ${storedUrl}`);
    } catch (error) {
      console.error("Error submitting URL:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div
        style={{
          margin: "50px",
          position: "sticky",
          top: "80px",
          zIndex: 100,
          background: "white",
        }}
      >
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
          <form
            onSubmit={handleUrlSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              type="text"
              placeholder="Enter URL"
              value={storedUrl}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                width: "100%",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "blue",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
              }}
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      <div className="add-container">
        {match.map((data, index) => (
          <div key={index}>
            {data.player_id} {data.player_name} {data.team}
          </div>
        ))}
        <h2 className="add-title">Select Cricket Tournament</h2>

        <div className="add-group">
          <label>Select Competition Type:</label>
          <select onChange={handleCategoryChange} value={category}>
            <option value="">Select an option</option>
            {Object.keys(options).map((key) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {category && options[category] && (
          <div className="add-group">
            <label>Select Format:</label>
            <select onChange={handleFormatChange} value={format}>
              <option value="">Select an option</option>
              {options[category].map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
        )}

        {allFieldsSelected && (
          <div className="add-player-details">
            <h3 className="add-subtitle">Player Data Preview</h3>

            <h3>Matched Batting Players</h3>
            <ul>
              {batting
                .filter((player) =>
                  match.some((m) => m.player_name === player.name)
                )
                .map((matchedPlayer, index) => (
                  <li key={index}>
                    {matchedPlayer.name} - Runs: {matchedPlayer.run}, Strike
                    Rate: {matchedPlayer.strikerate}, Team: {matchedPlayer.team}
                    , Role: {matchedPlayer.role}
                  </li>
                ))}
            </ul>

            <h3>Unmatched Batting Players</h3>
            <ul>
              {batting
                .filter(
                  (player) => !match.some((m) => m.player_name === player.name)
                )
                .map((unmatchedPlayer, index) => (
                  <li key={index}>
                    {unmatchedPlayer.name} - Runs: {unmatchedPlayer.run}, Strike
                    Rate: {unmatchedPlayer.strikerate}, Team:{" "}
                    {unmatchedPlayer.team}, Role: {unmatchedPlayer.role}
                  </li>
                ))}
            </ul>

            <h3>Matched Bowling Players</h3>
            <ul>
              {bowling
                .filter((player) =>
                  match.some((m) => m.player_name === player.name)
                )
                .map((matchedBowler, index) => (
                  <li key={index}>
                    {matchedBowler.name} - Wickets: {matchedBowler.wicket},
                    Economy: {matchedBowler.economy}, Team: {matchedBowler.team}
                    , Role: {matchedBowler.role}
                  </li>
                ))}
            </ul>

            <h3>Unmatched Bowling Players</h3>
            <ul>
              {bowling
                .filter(
                  (player) => !match.some((m) => m.player_name === player.name)
                )
                .map((unmatchedBowler, index) => (
                  <li key={index}>
                    {unmatchedBowler.name} - Wickets: {unmatchedBowler.wickets},
                    Economy: {unmatchedBowler.economy}, Team:{" "}
                    {unmatchedBowler.team}, Role: {unmatchedBowler.role}
                  </li>
                ))}
            </ul>

            <h3>Matched Batting_Bowling Players</h3>
            <ul>
              {batting_bowling
                .filter((player) =>
                  match.some((m) => m.player_name === player.name)
                )
                .map((matchedPlayer, index) => (
                  <li key={index}>
                    {matchedPlayer.name} - Runs: {matchedPlayer.run}, Strike
                    Rate: {matchedPlayer.strikerate}, Wickets:{" "}
                    {matchedPlayer.wicket}, Economy: {matchedPlayer.economy},
                    Team: {matchedPlayer.team}, Role: {matchedPlayer.role}
                  </li>
                ))}
            </ul>

            <h3>Unmatched Batting_Bowling Players</h3>
            <ul>
              {batting_bowling
                .filter(
                  (player) => !match.some((m) => m.player_name === player.name)
                )
                .map((unmatchedPlayer, index) => (
                  <li key={index}>
                    {unmatchedPlayer.name} - Runs: {unmatchedPlayer.run}, Strike
                    Rate: {unmatchedPlayer.strikerate}, Wickets:{" "}
                    {unmatchedPlayer.wicket}, Economy: {unmatchedPlayer.economy}
                    , Team: {unmatchedPlayer.team}, Role: {unmatchedPlayer.role}
                  </li>
                ))}
            </ul>

            <button onClick={handleSubmit} className="submit-button">
              Submit All Players
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Scraper;
