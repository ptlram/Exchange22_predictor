// import Navbar from "./navbar";
// import { useDispatch } from "react-redux";

// import { useState } from "react";
// import {
//   setcategory,
//   setformat,
//   setteam1,
//   setteam2,
// } from "./fetures/masterdata/masterSlice";
// const Home = () => {
//   const [category, setinputCategory] = useState("");
//   const [format, setinputFormat] = useState("");
//   const [team1, setinputteam1] = useState("");
//   const [team2, setinputteam2] = useState("");

//   const dispatch = useDispatch();

//   const handlemasterdata = () => {
//     dispatch(setcategory(category));
//     dispatch(setformat(format));
//     dispatch(setteam1(team1));
//     dispatch(setteam2(team2));
//   };

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
//   return (
//     <div>
//       <Navbar />

//       <div className="add-group">
//         <label>Select Competition Type:</label>
//         <select
//           onChange={(e) => setinputCategory(e.target.value)}
//           value={category}
//         >
//           <option value="">Select an option</option>
//           {Object.keys(options).map((key) => (
//             <option key={key} value={key}>
//               {key.charAt(0).toUpperCase() + key.slice(1)}
//             </option>
//           ))}
//         </select>
//       </div>

//       {category && options[category] && (
//         <div className="add-group">
//           <label>Select Format:</label>
//           <select
//             onChange={(e) => setinputFormat(e.target.value)}
//             value={format}
//           >
//             <option value="">Select an option</option>
//             {options[category].map((format) => (
//               <option key={format} value={format}>
//                 {format}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {format && teamOptions[format] && (
//         <div className="add-group">
//           <label>Select Team 1:</label>
//           <select onChange={(e) => setinputteam1(e.target.value)}>
//             <option value="">Select a team 1</option>
//             {teamOptions[format].map((team) => (
//               <option key={team} value={team}>
//                 {team}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {format && teamOptions[format] && (
//         <div className="add-group">
//           <label>Select Team 2:</label>
//           <select onChange={(e) => setinputteam2(e.target.value)}>
//             <option value="">Select a team 2</option>
//             {teamOptions[format].map((team) => (
//               <option key={team} value={team}>
//                 {team}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}
//       <button onClick={handlemasterdata}>show</button>
//     </div>
//   );
// };

// export default Home;

import Navbar from "./navbar";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import {
  setcategory,
  setformat,
  setteam1,
  setteam2,
} from "./fetures/masterdata/masterSlice";

const Home = () => {
  const [category, setinputCategory] = useState("");
  const [format, setinputFormat] = useState("");
  const [team1, setinputteam1] = useState("");
  const [team2, setinputteam2] = useState("");
  const [options, setOptions] = useState({});
  const [teamOptions, setTeamOptions] = useState({});
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

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

  const handlemasterdata = () => {
    dispatch(setcategory(category));
    dispatch(setformat(format));
    dispatch(setteam1(team1));
    dispatch(setteam2(team2));
  };

  return (
    <div>
      <Navbar />

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <div className="add-group">
            <label>Select Competition Type:</label>
            <select
              onChange={(e) => setinputCategory(e.target.value)}
              value={category}
            >
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
              <select
                onChange={(e) => setinputFormat(e.target.value)}
                value={format}
              >
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
            <>
              <div className="add-group">
                <label>Select Team 1:</label>
                <select onChange={(e) => setinputteam1(e.target.value)}>
                  <option value="">Select a team 1</option>
                  {teamOptions[format].map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              <div className="add-group">
                <label>Select Team 2:</label>
                <select onChange={(e) => setinputteam2(e.target.value)}>
                  <option value="">Select a team 2</option>
                  {teamOptions[format].map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button onClick={handlemasterdata}>Show</button>
        </>
      )}
    </div>
  );
};

export default Home;
