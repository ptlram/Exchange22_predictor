import React, { useState, useEffect } from "react";
import Player from "./Player";
import Navbar from "./navbar";
import "../css/Playerdetails.css";
import { useSelector } from "react-redux";

const Playerdetails = () => {
  const [details, setDetail] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const category = useSelector((state) => state.master.category);
  const format = useSelector((state) => state.master.format);
  const team1 = useSelector((state) => state.master.team1);
  const team2 = useSelector((state) => state.master.team2);

  const getDetail = async () => {
    try {
      const response = await fetch("http://localhost:5000/readplayers");
      const jsonData = await response.json();
      setDetail(jsonData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDetail();
  }, []);

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditData({ ...details[index] });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/updatematch/${editData.player_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        }
      );

      if (response.ok) {
        const updatedDetails = [...details];
        updatedDetails[editIndex] = editData;
        setDetail(updatedDetails);
        setEditIndex(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {details.map((data, index) => (
          <div key={index}>
            {editIndex === index ? (
              <div className="player-card">
                <div className="edit-card">
                  <h3>Edit Player</h3>

                  <div className="input-group">
                    <label>Player Name</label>
                    <input
                      type="text"
                      name="player_name"
                      value={editData.player_name}
                      onChange={handleChange}
                      placeholder="Enter player name"
                    />
                  </div>

                  <div className="input-group">
                    <label>Role</label>
                    <input
                      type="text"
                      name="role"
                      value={editData.role}
                      onChange={handleChange}
                      placeholder="Batsman / Bowler / All-rounder"
                    />
                  </div>

                  <div className="input-group">
                    <label>Team</label>
                    <input
                      type="text"
                      name="team"
                      value={editData.team}
                      onChange={handleChange}
                      placeholder="Enter team name"
                    />
                  </div>

                  {/* Buy & Sell in One Row */}
                  <div className="row-group">
                    <div className="input-group">
                      <label>Buy Price</label>
                      <input
                        type="text"
                        name="buy"
                        value={editData.buy}
                        onChange={handleChange}
                        placeholder="Buy price"
                      />
                    </div>
                    <div className="input-group">
                      <label>Sell Price</label>
                      <input
                        type="text"
                        name="sell"
                        value={editData.sell}
                        onChange={handleChange}
                        placeholder="Sell price"
                      />
                    </div>
                  </div>

                  {/* Runs & Strike Rate in One Row */}
                  <div className="row-group">
                    <div className="input-group">
                      <label>Runs</label>
                      <input
                        type="text"
                        name="runs"
                        value={editData.runs}
                        onChange={handleChange}
                        placeholder="Enter runs"
                      />
                    </div>
                    <div className="input-group">
                      <label>Strike Rate</label>
                      <input
                        type="text"
                        name="strikerate"
                        value={editData.strikerate}
                        onChange={handleChange}
                        placeholder="Enter strike rate"
                      />
                    </div>
                  </div>

                  {/* Wickets & Economy in One Row */}
                  <div className="row-group">
                    <div className="input-group">
                      <label>Wickets</label>
                      <input
                        type="text"
                        name="wicket"
                        value={editData.wicket}
                        onChange={handleChange}
                        placeholder="Enter wickets"
                      />
                    </div>
                    <div className="input-group">
                      <label>Economy</label>
                      <input
                        type="text"
                        name="economy"
                        value={editData.economy}
                        onChange={handleChange}
                        placeholder="Enter economy"
                      />
                    </div>
                  </div>

                  <div className="button-group">
                    <button onClick={handleSave} className="save-btn">
                      Save
                    </button>
                    <button
                      onClick={() => setEditIndex(null)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {category === data.category &&
                  format === data.format &&
                  (team1 === data.team || team2 === data.team) && (
                    <div className="player-card">
                      <Player {...data} />
                      <button
                        onClick={() => handleEdit(index)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                    </div>
                  )}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Playerdetails;
