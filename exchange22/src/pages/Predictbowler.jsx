import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import "../css/bowler.css"; // Importing CSS
import { useSelector } from "react-redux";

const Predictbowler = () => {
  const [bowlerPerformance, setBowlerPerformance] = useState([]);
  const category = useSelector((state) => state.master.category);
  const format = useSelector((state) => state.master.format);
  const team1 = useSelector((state) => state.master.team1);
  const team2 = useSelector((state) => state.master.team2);

  useEffect(() => {
    getDetails();
  }, []);

  const getDetails = async () => {
    try {
      const response = await fetch("http://localhost:5000/readplayers");
      const jsonData = await response.json();
      calculatePerformance(jsonData);
    } catch (error) {
      console.log(error);
    }
  };

  // Function to calculate points for a bowler
  const calculatePoints = (player) => {
    let points = 0;

    // Wickets: 20 points per wicket
    if (player.wicket) {
      const wickets = player.wicket.split(",").map(Number);
      points += wickets.reduce((a, b) => a + b, 0) * 20;
    }

    // Economy Bonus: Economy rate < 6 gets 5 points
    if (player.economy) {
      const economies = player.economy.split(",").map(Number);
      const avgEconomy =
        economies.reduce((a, b) => a + b, 0) / economies.length;
      if (avgEconomy < 6) {
        points += 5;
      }
    }

    return points;
  };

  // Function to calculate accuracy for buy and sell
  const calculateAccuracy = (player, points) => {
    const buy = player.buy ? Number(player.buy) : 0;
    const sell = player.sell ? Number(player.sell) : 0;
    if (buy <= 0 || sell <= 0) return { buyAccuracy: 0, sellAccuracy: 0 };

    const maxBuyEarnings = buy * 2;
    const maxSellThreshold = sell * 2;

    const buyAccuracy = ((points / maxBuyEarnings) * 100).toFixed(2);
    const sellAccuracy = (
      ((maxSellThreshold - points) / maxSellThreshold) *
      100
    ).toFixed(2);

    return { buyAccuracy, sellAccuracy };
  };

  // Function to calculate overall bowler performance
  const calculatePerformance = (players) => {
    const bowlers = players
      .filter((player) => player.role === "bowler")
      .map((player) => {
        const points = calculatePoints(player);
        const { buyAccuracy, sellAccuracy } = calculateAccuracy(player, points);

        return {
          name: player.player_name,
          category: player.category,
          format: player.format,
          team: player.team,
          points,
          buyAccuracy,
          sellAccuracy,
          isBestBuy: false,
          isBestSell: false,
        };
      });

    if (bowlers.length > 0) {
      let bestBuy = bowlers.reduce((max, player) =>
        player.buyAccuracy > max.buyAccuracy ? player : max
      );
      let bestSell = bowlers.reduce((max, player) =>
        player.sellAccuracy > max.sellAccuracy ? player : max
      );

      bowlers.forEach((player) => {
        if (player.name === bestBuy.name) player.isBestBuy = true;
        if (player.name === bestSell.name) player.isBestSell = true;
      });
    }

    setBowlerPerformance(bowlers);
  };

  return (
    <div className="predict-bowler-container">
      <Navbar />

      <h2 className="predict-bowler-title">Bowler Performance Analysis</h2>
      <table className="predict-bowler-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Points</th>
            <th>BUY Accuracy %</th>
            <th>SELL Accuracy %</th>
          </tr>
        </thead>
        <tbody>
          {bowlerPerformance
            .filter(
              (player) =>
                category === player.category &&
                format === player.format &&
                (team1 === player.team || team2 === player.team)
            )
            .map((player, index) => (
              <tr
                key={index}
                className={`${player.isBestBuy ? "best-buy" : ""} ${
                  player.isBestSell ? "best-sell" : ""
                }`}
              >
                <td>{player.name}</td>
                <td>{player.points}</td>
                <td>{player.buyAccuracy ? `${player.buyAccuracy}%` : "-"}</td>
                <td>{player.sellAccuracy ? `${player.sellAccuracy}%` : "-"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Predictbowler;
