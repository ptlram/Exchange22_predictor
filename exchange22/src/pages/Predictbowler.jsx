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

  const calculatePerformance = (players) => {
    const bowlers = [];
    let bestEconomy = Infinity;

    players.forEach((data) => {
      if (data.role === "bowler") {
        const economies = data.economy
          ? data.economy.split(",").map(Number)
          : [];
        if (economies.length > 0) {
          const avgEconomy =
            economies.reduce((a, b) => a + b, 0) / economies.length;
          bestEconomy = Math.min(bestEconomy, avgEconomy);
        }
      }
    });

    players.forEach((data) => {
      if (data.role === "bowler") {
        const wickets = data.wicket ? data.wicket.split(",").map(Number) : [];
        const economies = data.economy
          ? data.economy.split(",").map(Number)
          : [];
        const buy = data.buy ? Number(data.buy) : 0;
        const sell = data.sell ? Number(data.sell) : 0;

        if (wickets.length > 0 && economies.length > 0 && buy > 0 && sell > 0) {
          const maxBuyEarnings = buy * 2;
          const maxSellThreshold = sell * 2;

          const avgEconomy =
            economies.reduce((a, b) => a + b, 0) / economies.length;

          // Economy impact (Only 10% weight)
          const economyImpact = (bestEconomy / avgEconomy) * 10;

          // Calculate points for each match
          const wicketPoints = wickets.map((w) =>
            w >= 3 ? w * 20 + 5 : w * 20
          );

          // Calculate BUY Success % for each match
          const buySuccessPercentages = wicketPoints.map(
            (points) => ((points + economyImpact) / maxBuyEarnings) * 100
          );
          const avgBuySuccess =
            buySuccessPercentages.reduce((acc, val) => acc + val, 0) /
            buySuccessPercentages.length;

          // Calculate SELL Accuracy % for each match
          const sellAccuracyPercentages = wicketPoints.map(
            (points) =>
              ((maxSellThreshold - (points + economyImpact)) /
                maxSellThreshold) *
              100
          );
          const avgSellAccuracy =
            sellAccuracyPercentages.reduce((acc, val) => acc + val, 0) /
            sellAccuracyPercentages.length;

          bowlers.push({
            name: data.player_name,
            category: data.category,
            format: data.format,
            team: data.team,
            buySuccess: avgBuySuccess.toFixed(2),
            sellAccuracy: avgSellAccuracy.toFixed(2),
            avgEconomy: avgEconomy.toFixed(2),
          });
        }
      }
    });

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
            <th>BUY Success %</th>
            <th>SELL Accuracy %</th>
          </tr>
        </thead>
        <tbody>
          {bowlerPerformance.map((player, index) => (
            <tr
              key={index}
              className={`${
                team1 === player.team
                  ? "team1"
                  : team2 === player.team
                  ? "team2"
                  : ""
              }`}
            >
              {category === player.category &&
                format === player.format &&
                (team1 === player.team || team2 === player.team) && (
                  <>
                    <td>{player.name}</td>
                    <td
                      className={`buy-success ${
                        player.buySuccess >= 60 ? "high" : ""
                      }`}
                    >
                      {player.buySuccess}%
                    </td>
                    <td
                      className={`sell-accuracy ${
                        player.sellAccuracy >= 60 ? "high" : ""
                      }`}
                    >
                      {player.sellAccuracy}%
                    </td>
                  </>
                )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Predictbowler;
