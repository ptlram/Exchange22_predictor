// import { useState } from "react";
// import "../css/add.css"; // Import the CSS file
// import Navbar from "./navbar";

// export default function Add() {
//   const [category, setCategory] = useState("");
//   const [format, setFormat] = useState("");
//   const [team, setTeam] = useState("");
//   const [player_name, setPlayerName] = useState("");
//   const [buy, setBuy] = useState(0);
//   const [sell, setSell] = useState(0);
//   const [role, setRole] = useState("");
//   const [runs, setRuns] = useState("");
//   const [strikerate, setStrikerate] = useState("");
//   const [wicket, setWicket] = useState("");
//   const [economy, setEconomy] = useState("");

//   const options = {
//     international: ["T20", "One-Day", "Test"],
//     league: ["IPL", "WPL", "BBL", "PSL"],
//     other: ["Friendly", "Charity", "Club"],
//   };

//   const teamOptions = {
//     T20: [
//       "India",
//       "Australia",
//       "England",
//       "Pakistan",
//       "New Zealand",
//       "West Indies",
//       "South Africa",
//       "Sri Lanka",
//     ],
//     "One-Day": [
//       "India",
//       "Australia",
//       "England",
//       "Pakistan",
//       "New Zealand",
//       "West Indies",
//       "South Africa",
//       "Sri Lanka",
//     ],
//     Test: [
//       "India",
//       "Australia",
//       "England",
//       "Pakistan",
//       "New Zealand",
//       "West Indies",
//       "South Africa",
//       "Sri Lanka",
//     ],
//     IPL: [
//       "Mumbai Indians",
//       "Chennai Super Kings",
//       "RCB",
//       "Kolkata Knight Riders",
//     ],
//     WPL: ["RCB", "GG", "DC", "MI", "UP"],
//     BBL: [
//       "Sydney Sixers",
//       "Melbourne Stars",
//       "Brisbane Heat",
//       "Perth Scorchers",
//     ],
//     PSL: [
//       "Lahore Qalandars",
//       "Karachi Kings",
//       "Peshawar Zalmi",
//       "Islamabad United",
//     ],
//     Friendly: ["Team A", "Team B", "Team C"],
//     Charity: ["Legends XI", "World XI"],
//     Club: ["Club A", "Club B", "Club C"],
//   };

//   const handleCategoryChange = (e) => {
//     setCategory(e.target.value);
//     setFormat("");
//     setTeam("");
//   };

//   const handleFormatChange = (e) => {
//     setFormat(e.target.value);
//     setTeam("");
//   };
//   const allFieldsSelected = category && format && team;

//   const handleSubmit = async () => {
//     const playerData = {
//       category,
//       format,
//       team,
//       player_name,
//       buy,
//       sell,
//       role,
//       runs,
//       strikerate,
//       wicket,
//       economy,
//     };

//     try {
//       const response = await fetch("http://localhost:5000/players", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(playerData),
//       });

//       const text = await response.text(); // Read response as text first

//       try {
//         const result = JSON.parse(text); // Attempt to parse as JSON
//         console.log("Success:", result);
//         alert("Player data submitted successfully!");
//       } catch {
//         console.log("Server Response:", text);
//         alert("Player data submitted, but response is not JSON.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Failed to submit player data.");
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="add-container">
//         <h2 className="add-title">Select Cricket Tournament</h2>

//         <div className="add-group">
//           <label>Select Competition Type:</label>
//           <select onChange={handleCategoryChange} value={category}>
//             <option value="">Select an option</option>
//             {Object.keys(options).map((key) => (
//               <option key={key} value={key}>
//                 {key.charAt(0).toUpperCase() + key.slice(1)}
//               </option>
//             ))}
//           </select>
//         </div>

//         {category && options[category] && (
//           <div className="add-group">
//             <label>Select Format:</label>
//             <select onChange={handleFormatChange} value={format}>
//               <option value="">Select an option</option>
//               {options[category].map((format) => (
//                 <option key={format} value={format}>
//                   {format}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {format && teamOptions[format] && (
//           <div className="add-group">
//             <label>Select Team:</label>
//             <select onChange={(e) => setTeam(e.target.value)} value={team}>
//               <option value="">Select a team</option>
//               {teamOptions[format].map((team) => (
//                 <option key={team} value={team}>
//                   {team}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {allFieldsSelected && (
//           <div className="add-player-details">
//             <h3 className="add-subtitle">Player Details</h3>
//             <label>Player Name:</label>
//             <input
//               type="text"
//               value={player_name}
//               onChange={(e) => setPlayerName(e.target.value)}
//               required
//             />
//             <label>Buy Price:</label>
//             <input
//               type="text"
//               value={buy}
//               onChange={(e) => setBuy(e.target.value)}
//             />
//             <label>Sell Price:</label>
//             <input
//               type="text"
//               value={sell}
//               onChange={(e) => setSell(e.target.value)}
//             />
//             <label>Player Type:</label>
//             <select
//               className="add-player-role"
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               required
//             >
//               <option value="">Select Player Type</option>
//               <option value="batsman">Batsman</option>
//               <option value="bowler">Bowler</option>
//               <option value="allrounder">All-Rounder</option>
//             </select>
//             <label>Runs:</label>
//             <input
//               type="text"
//               value={runs}
//               onChange={(e) => setRuns(e.target.value)}
//               placeholder="e.g., 50, 100, 75"
//             />
//             <label>Strike Rate:</label>
//             <input
//               type="text"
//               value={strikerate}
//               onChange={(e) => setStrikerate(e.target.value)}
//               placeholder="e.g., 50, 100, 75"
//             />
//             <label>Wickets:</label>
//             <input
//               type="text"
//               value={wicket}
//               onChange={(e) => setWicket(e.target.value)}
//               placeholder="e.g., 1, 3, 5"
//             />
//             <label>Economy:</label>
//             <input
//               type="text"
//               value={economy}
//               onChange={(e) => setEconomy(e.target.value)}
//               placeholder="e.g., 4.5, 6.2, 7.8"
//             />
//             <button onClick={handleSubmit} className="submit-button">
//               Submit
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }
import { useState, useEffect } from "react";
import "../css/add.css"; // Import the CSS file
import Navbar from "./navbar";

export default function Add() {
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const [team, setTeam] = useState("");
  const [player_name, setPlayerName] = useState("");
  const [buy, setBuy] = useState(0);
  const [sell, setSell] = useState(0);
  const [role, setRole] = useState("");
  const [runs, setRuns] = useState("");
  const [strikerate, setStrikerate] = useState("");
  const [wicket, setWicket] = useState("");
  const [economy, setEconomy] = useState("");
  const [options, setOptions] = useState({});
  const [teamOptions, setTeamOptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/data")
      .then((response) => response.json())
      .then((data) => {
        setOptions(data.options);
        setTeamOptions(data.teamOptions);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setFormat("");
    setTeam("");
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
    setTeam("");
  };

  const allFieldsSelected = category && format && team;

  const handleSubmit = async () => {
    const playerData = {
      category,
      format,
      team,
      player_name,
      buy,
      sell,
      role,
      runs,
      strikerate,
      wicket,
      economy,
    };

    try {
      const response = await fetch("http://localhost:5000/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerData),
      });

      const text = await response.text();

      try {
        const result = JSON.parse(text);
        console.log("Success:", result);
        alert("Player data submitted successfully!");
      } catch {
        console.log("Server Response:", text);
        alert("Player data submitted, but response is not JSON.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit player data.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-container">
        <h2 className="add-title">Select Cricket Tournament</h2>

        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
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

            {format && teamOptions[format] && (
              <div className="add-group">
                <label>Select Team:</label>
                <select onChange={(e) => setTeam(e.target.value)} value={team}>
                  <option value="">Select a team</option>
                  {teamOptions[format].map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {allFieldsSelected && (
          <div className="add-player-details">
            <h3 className="add-subtitle">Player Details</h3>
            <label>Player Name:</label>
            <input
              type="text"
              value={player_name}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />
            <label>Buy Price:</label>
            <input
              type="text"
              value={buy}
              onChange={(e) => setBuy(e.target.value)}
            />
            <label>Sell Price:</label>
            <input
              type="text"
              value={sell}
              onChange={(e) => setSell(e.target.value)}
            />
            <label>Player Type:</label>
            <select
              className="add-player-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Player Type</option>
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="allrounder">All-Rounder</option>
            </select>
            <label>Runs:</label>
            <input
              type="text"
              value={runs}
              onChange={(e) => setRuns(e.target.value)}
              placeholder="e.g., 50, 100, 75"
            />
            <label>Strike Rate:</label>
            <input
              type="text"
              value={strikerate}
              onChange={(e) => setStrikerate(e.target.value)}
              placeholder="e.g., 50, 100, 75"
            />
            <label>Wickets:</label>
            <input
              type="text"
              value={wicket}
              onChange={(e) => setWicket(e.target.value)}
              placeholder="e.g., 1, 3, 5"
            />
            <label>Economy:</label>
            <input
              type="text"
              value={economy}
              onChange={(e) => setEconomy(e.target.value)}
              placeholder="e.g., 4.5, 6.2, 7.8"
            />
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>
        )}
      </div>
    </>
  );
}
