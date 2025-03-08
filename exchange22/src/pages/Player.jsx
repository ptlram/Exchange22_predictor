import React from "react";
import "../css/playercard.css";
import { useSelector } from "react-redux";

const Player = (props) => {
  const team1 = useSelector((state) => state.master.team1);
  const team2 = useSelector((state) => state.master.team2);
  return (
    <div
      className={`player-card ${
        team1 === props.team ? "team1" : team2 === props.team ? "team2" : ""
      }`}
    >
      {/* Player Info */}
      <div className="player-info">
        {/* Avatar */}
        <div className="avatar">
          <span className="avatar-placeholder">👤</span>
        </div>
        {/* Name and Role */}
        <div className="name-role">
          <h2 className="name">{props.player_name}</h2>
          <p className="role">{props.role}</p>
        </div>
      </div>

      {/* Team Badge */}
      <div className="team-code">
        <span className="team-code-badge">{props.team}</span>
      </div>

      {/* Player Stats */}
      <div className="transaction-info">
        <div className="transaction-item">
          <p className="transaction-label">Runs:</p>
          <p className="transaction-value">{props.runs}</p>
        </div>
        <div className="transaction-item">
          <p className="transaction-label">Wickets:</p>
          <p className="transaction-value">{props.wicket}</p>
        </div>
        <div className="transaction-item">
          <p className="transaction-label">Strike Rate:</p>
          <p className="transaction-value">{props.strikerate}</p>
        </div>
        <div className="transaction-item">
          <p className="transaction-label">Economy:</p>
          <p className="transaction-value">{props.economy}</p>
        </div>
      </div>

      {/* Buy/Sell Buttons */}
      <div className="action-buttons">
        <button className="buy-button">Buy: {props.buy}</button>
        <button className="sell-button">Sell: {props.sell}</button>
      </div>
    </div>
  );
};

export default Player;
