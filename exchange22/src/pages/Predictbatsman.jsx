import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import "../css/batsman.css"; // Importing the CSS file
import { useSelector } from "react-redux";

const Predictbatsman = () => {
  const [batsmanPerformance, setBatsmanPerformance] = useState([]);
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
      console.log("API Response:", jsonData);
    } catch (error) {
      console.log(error);
    }
  };

  const calculatePerformance = (players) => {
    const batsmen = [];
    let bestStrikeRate = 0;

    // Find the best (highest) strike rate among all batsmen
    players.forEach((data) => {
      if (data.role === "batsman") {
        const strikeRates = data.strikerate
          ? data.strikerate.split(",").map(Number)
          : [];
        if (strikeRates.length > 0) {
          const avgSR =
            strikeRates.reduce((a, b) => a + b, 0) / strikeRates.length;
          bestStrikeRate = Math.max(bestStrikeRate, avgSR);
        }
      }
    });

    players.forEach((data) => {
      if (data.role === "batsman") {
        const runs = data.runs ? data.runs.split(",").map(Number) : [];
        const strikeRates = data.strikerate
          ? data.strikerate.split(",").map(Number)
          : [];
        const buy = data.buy ? Number(data.buy) : 0;
        const sell = data.sell ? Number(data.sell) : 0;

        if (runs.length > 0 && strikeRates.length > 0 && buy > 0 && sell > 0) {
          const maxBuyEarnings = buy * 2;
          const maxSellThreshold = sell * 2;

          // Calculate average strike rate
          const avgStrikeRate =
            strikeRates.reduce((a, b) => a + b, 0) / strikeRates.length;

          // Strike rate impact (20% weight)
          const strikeRateImpact = (avgStrikeRate / bestStrikeRate) * 20;

          // Calculate BUY Success %
          const buySuccessPercentages = runs.map(
            (run) => (run / maxBuyEarnings) * 80 + strikeRateImpact
          );
          const avgBuySuccess =
            buySuccessPercentages.reduce((acc, val) => acc + val, 0) /
            buySuccessPercentages.length;

          // Calculate SELL Accuracy %
          const sellAccuracyPercentages = runs.map(
            (run) =>
              ((maxSellThreshold - run) / maxSellThreshold) * 80 +
              (20 - strikeRateImpact)
          );
          const avgSellAccuracy =
            sellAccuracyPercentages.reduce((acc, val) => acc + val, 0) /
            sellAccuracyPercentages.length;

          batsmen.push({
            name: data.player_name,
            category: data.category,
            format: data.format,
            team: data.team,
            buySuccess: avgBuySuccess.toFixed(2),
            sellAccuracy: avgSellAccuracy.toFixed(2),
            avgStrikeRate: avgStrikeRate.toFixed(2),
          });
        }
      }
    });

    setBatsmanPerformance(batsmen);
    console.log("Batsman Performance Data:", batsmanPerformance);
  };

  return (
    <div className="predict-batsman-container">
      <Navbar />

      <h2 className="predict-batsman-title">Batsman Performance Analysis</h2>
      <table className="predict-batsman-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>BUY Success %</th>
            <th>SELL Accuracy %</th>
          </tr>
        </thead>
        <tbody>
          {batsmanPerformance.map((player, index) => (
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

export default Predictbatsman;
