import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import "../css/allrounder.css";
import { useSelector } from "react-redux";

const Predictallrounder = () => {
  const [allrounders, setAllrounders] = useState([]);
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
    const allRounders = [];
    let bestStrikeRate = 0;
    let maxWicket = 1;
    let bestEconomy = 10;

    players.forEach((data) => {
      if (data.role === "allrounder") {
        const strikeRates = data.strikerate
          ? data.strikerate.split(",").map(Number)
          : [];
        if (strikeRates.length > 0) {
          const avgSR =
            strikeRates.reduce((a, b) => a + b, 0) / strikeRates.length;
          bestStrikeRate = Math.max(bestStrikeRate, avgSR);
        }

        const wickets = data.wicket ? data.wicket.split(",").map(Number) : [];
        const economyRates = data.economy
          ? data.economy.split(",").map(Number)
          : [];

        if (wickets.length > 0) {
          const totalWickets = wickets.reduce((a, b) => a + b, 0);
          maxWicket = Math.max(maxWicket, totalWickets);
        }

        if (economyRates.length > 0) {
          const avgEconomy =
            economyRates.reduce((a, b) => a + b, 0) / economyRates.length;
          bestEconomy = Math.min(bestEconomy, avgEconomy);
        }
      }
    });

    players.forEach((data) => {
      if (data.role === "allrounder") {
        const runs = data.runs ? data.runs.split(",").map(Number) : [];
        const strikeRates = data.strikerate
          ? data.strikerate.split(",").map(Number)
          : [];
        const buy = data.buy ? Number(data.buy) : 0;
        const sell = data.sell ? Number(data.sell) : 0;

        const wickets = data.wicket ? data.wicket.split(",").map(Number) : [];
        const economyRates = data.economy
          ? data.economy.split(",").map(Number)
          : [];

        if (
          runs.length > 0 &&
          strikeRates.length > 0 &&
          wickets.length > 0 &&
          buy > 0 &&
          sell > 0
        ) {
          const maxBuyEarnings = buy * 2;
          const maxSellThreshold = sell * 2;

          const avgStrikeRate =
            strikeRates.reduce((a, b) => a + b, 0) / strikeRates.length;
          const strikeRateImpact = (avgStrikeRate / bestStrikeRate) * 20;

          const battingBuySuccessPercentages = runs.map(
            (run) => (run / maxBuyEarnings) * 80 + strikeRateImpact
          );
          const avgBattingBuySuccess =
            battingBuySuccessPercentages.reduce((acc, val) => acc + val, 0) /
            battingBuySuccessPercentages.length;

          const battingSellAccuracyPercentages = runs.map(
            (run) =>
              ((maxSellThreshold - run) / maxSellThreshold) * 80 +
              (20 - strikeRateImpact)
          );
          const avgBattingSellAccuracy =
            battingSellAccuracyPercentages.reduce((acc, val) => acc + val, 0) /
            battingSellAccuracyPercentages.length;

          const totalWickets = wickets.reduce((a, b) => a + b, 0);
          const avgEconomy =
            economyRates.length > 0
              ? economyRates.reduce((a, b) => a + b, 0) / economyRates.length
              : 10;

          const bowlingPerformance =
            (totalWickets / maxWicket) * 90 + (bestEconomy / avgEconomy) * 10;

          const avgBuySuccess =
            avgBattingBuySuccess * 0.5 + bowlingPerformance * 0.5;
          const avgSellAccuracy =
            avgBattingSellAccuracy * 0.5 + (100 - bowlingPerformance) * 0.5;

          allRounders.push({
            name: data.player_name,
            category: data.category,
            format: data.format,
            team: data.team,
            buySuccess: avgBuySuccess.toFixed(2),
            sellAccuracy: avgSellAccuracy.toFixed(2),
            avgStrikeRate: avgStrikeRate.toFixed(2),
            totalWickets: totalWickets,
            avgEconomy: avgEconomy.toFixed(2),
          });
        }
      }
    });

    setAllrounders(allRounders);
  };

  return (
    <div className="container">
      <Navbar />
      <h2 className="title">All-rounder Performance Analysis</h2>
      <table className="performance-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>BUY Success %</th>
            <th>SELL Accuracy %</th>
          </tr>
        </thead>
        <tbody>
          {allrounders.map((player, index) => (
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
                    <td className={player.buySuccess >= 60 ? "success" : ""}>
                      {player.buySuccess}%
                    </td>
                    <td className={player.sellAccuracy >= 60 ? "danger" : ""}>
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

export default Predictallrounder;
