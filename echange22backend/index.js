import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import pg from "pg";
// import puppeteer from "puppeteer"; for web scraping

const { Client } = pg;
const conn = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "ram@1103",
  database: "cricket",
});
conn.connect().then(() => console.log("connected"));

const app = express();
app.use(cors());
app.use(express.json());

//API
const baseUrl = "https://www.cricbuzz.com";
// const url =
//   "https://www.cricbuzz.com/live-cricket-scorecard/112680/ggtw-vs-rcbw-1st-match-womens-premier-league-2025";

let url = "";
app.post("/url", (req, res) => {
  const { storedUrl } = req.body;

  if (!storedUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  url = storedUrl; // Save the URL in memory
  console.log("Received URL:", storedUrl);
  res.json({ message: "URL submitted successfully", storedUrl });
});

// Route to fetch categories, formats, and teams
app.get("/api/data", async (req, res) => {
  try {
    // Fetch category -> format mapping
    const categoryResult = await conn.query(`
      SELECT c.category, f.format_name 
      FROM format f
      JOIN category c ON f.category_id = c.id
      ORDER BY c.category, f.format_name;
    `);

    // Fetch format -> team mapping
    const teamResult = await conn.query(`
      SELECT f.format_name, t.team_name 
      FROM team t
      JOIN format f ON t.format_id = f.id
      ORDER BY f.format_name, t.team_name;
    `);

    // Convert to required format
    const options = {};
    categoryResult.rows.forEach(({ category, format_name }) => {
      if (!options[category]) options[category] = [];
      options[category].push(format_name);
    });

    const teamOptions = {};
    teamResult.rows.forEach(({ format_name, team_name }) => {
      if (!teamOptions[format_name]) {
        teamOptions[format_name] = []; // Initialize array if not exists
      }
      teamOptions[format_name].push(team_name); // Append team to format
    });

    res.json({ options, teamOptions }); // Send response as JSON
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/cricket", async (req, res) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let inningsData = {
      inning_1: { team: "", batting: [], bowling: [] },
      inning_2: { team: "", batting: [], bowling: [] },
    };

    let profileUrls = [];

    const extractBattingData = (inningId, teamKey) => {
      let teamName = $(`#${inningId} .cb-scrd-hdr-rw span`)
        .first()
        .text()
        .trim()
        .replace(/Innings/i, "")
        .trim();

      inningsData[teamKey].team = teamName;

      $(`#${inningId} .cb-col.cb-col-100.cb-scrd-itms`).each(
        (index, element) => {
          let batsmanName = $(element)
            .find(".cb-col.cb-col-25 a.cb-text-link")
            .text()
            .trim();
          let playerrun = $(element)
            .find(".cb-col.cb-col-8.text-right.text-bold")
            .text()
            .trim();
          let playerStrikeRate = $(element)
            .find(".cb-col.cb-col-8.text-right")
            .last()
            .text()
            .trim();

          let batsmanProfilePath = $(element)
            .find(".cb-col.cb-col-25 a")
            .attr("href");
          let batsmanProfileUrl = batsmanProfilePath
            ? baseUrl + batsmanProfilePath
            : null;

          if (batsmanName) {
            inningsData[teamKey].batting.push({
              name: batsmanName,
              run: playerrun || "0",
              strikerate: playerStrikeRate || "0.00",
              team: teamName,
              role: "Fetching...",
              isBatsman: true,
            });

            if (batsmanProfileUrl)
              profileUrls.push({ name: batsmanName, url: batsmanProfileUrl });
          }
        }
      );
    };

    const extractBowlingData = (inningId, teamKey) => {
      let bowlingTeam =
        inningsData[teamKey === "inning_1" ? "inning_2" : "inning_1"].team;

      $(`#${inningId} .cb-col.cb-col-100.cb-scrd-itms`).each(
        (index, element) => {
          let bowlerName = $(element)
            .find(".cb-col.cb-col-38 a.cb-text-link")
            .text()
            .trim();
          let wickets = $(element)
            .find(".cb-col.cb-col-8.text-right.text-bold")
            .text()
            .trim();
          let economy = $(element)
            .find(".cb-col.cb-col-10.text-right")
            .last()
            .text()
            .trim();

          let bowlerProfilePath = $(element)
            .find(".cb-col.cb-col-38 a")
            .attr("href");
          let bowlerProfileUrl = bowlerProfilePath
            ? baseUrl + bowlerProfilePath
            : null;

          if (bowlerName) {
            inningsData[teamKey].bowling.push({
              name: bowlerName,
              wicket: wickets || "0",
              economy: economy || "0.00",
              team: bowlingTeam,
              role: "Fetching...",
              isBowler: true,
            });

            if (bowlerProfileUrl)
              profileUrls.push({ name: bowlerName, url: bowlerProfileUrl });
          }
        }
      );
    };

    extractBattingData("innings_1", "inning_1");
    extractBattingData("innings_2", "inning_2");
    extractBowlingData("innings_1", "inning_1");
    extractBowlingData("innings_2", "inning_2");

    const playerProfiles = await Promise.all(
      profileUrls.map(async (player) => {
        try {
          const profileResponse = await axios.get(player.url);
          const $ = cheerio.load(profileResponse.data);
          let role = $(".cb-col.cb-col-60.cb-lst-itm-sm").eq(2).text().trim();

          if (/Allrounder|All-rounder|all-rounder/i.test(role))
            role = "allrounder";
          else if (/Bowler/i.test(role)) role = "bowler";
          else if (/Batsman|WK-Batsman/i.test(role)) role = "batsman";
          else role = "N/A";

          return { name: player.name, role };
        } catch (error) {
          console.error(`Error fetching profile for ${player.name}:`, error);
          return { name: player.name, role: "N/A" };
        }
      })
    );

    let batting_bowling = [];
    let batting = [];
    let bowling = [];
    let allPlayers = new Map();

    Object.keys(inningsData).forEach((inningKey) => {
      inningsData[inningKey].batting.forEach((batsman) => {
        let profileData =
          playerProfiles.find((p) => p.name === batsman.name) || {};
        let playerData = {
          ...batsman,
          role: profileData.role,
          isBatsman: true,
        };
        allPlayers.set(batsman.name, playerData);
      });

      inningsData[inningKey].bowling.forEach((bowler) => {
        let profileData =
          playerProfiles.find((p) => p.name === bowler.name) || {};
        let playerData = { ...bowler, role: profileData.role, isBowler: true };

        if (allPlayers.has(bowler.name)) {
          let existingData = allPlayers.get(bowler.name);
          allPlayers.set(bowler.name, {
            ...existingData,
            ...playerData,
            isBowler: true,
          });
        } else {
          allPlayers.set(bowler.name, playerData);
        }
      });
    });

    allPlayers.forEach((player, playerName) => {
      let existingKey = [...allPlayers.keys()].find(
        (key) => key.includes(playerName) || playerName.includes(key)
      );

      if (existingKey && existingKey !== playerName) {
        let existingPlayer = allPlayers.get(existingKey);
        allPlayers.set(existingKey, {
          name: existingPlayer.name || player.name,
          team: existingPlayer.team || player.team,
          role: player.role,
          run: existingPlayer.run || player.run || "0",
          strikerate: existingPlayer.strikerate || player.strikerate || "0.00",
          isBatsman: existingPlayer.isBatsman || player.isBatsman,
          wicket: existingPlayer.wicket || player.wicket || "0",
          economy: existingPlayer.economy || player.economy || "0.00",
          isBowler: existingPlayer.isBowler || player.isBowler,
        });
        allPlayers.delete(playerName);
      }
    });

    allPlayers.forEach((player) => {
      let battedInInning1 = inningsData.inning_1.batting.find(
        (b) => b.name === player.name
      );
      let bowledInInning2 = inningsData.inning_2.bowling.find(
        (b) => b.name === player.name
      );

      let bowledInInning1 = inningsData.inning_1.bowling.find(
        (b) => b.name === player.name
      );
      let battedInInning2 = inningsData.inning_2.batting.find(
        (b) => b.name === player.name
      );

      // Merge batting and bowling stats if player appears in both innings
      if (battedInInning1 || battedInInning2) {
        player.run = battedInInning1?.run || battedInInning2?.run || "0";
        player.strikerate =
          battedInInning1?.strikerate || battedInInning2?.strikerate || "0.00";
        player.isBatsman = true;
      }

      if (bowledInInning1 || bowledInInning2) {
        player.wicket =
          bowledInInning1?.wicket || bowledInInning2?.wicket || "0";
        player.economy =
          bowledInInning1?.economy || bowledInInning2?.economy || "0.00";
        player.isBowler = true;
      }

      // Categorize correctly
      if (player.isBatsman && player.isBowler) {
        batting_bowling.push(player);
      } else if (player.isBatsman) {
        batting.push(player);
      } else if (player.isBowler) {
        bowling.push(player);
      }
    });

    // res.json({ inningsData });
    res.json({ batting_bowling, batting, bowling });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/matchcatformat", async (req, res) => {
  try {
    // Ensure correct request body parsing
    const { category, format } = req.body;

    console.log("Received request with:", category, format); // Debugging

    if (!category || !format) {
      return res
        .status(400)
        .json({ error: "Category and format are required." });
    }

    const query = `
      SELECT * FROM player WHERE category = $1 AND format = $2
    `;

    const { rows } = await conn.query(query, [category, format]);

    console.log("Query Result:", rows); // Debugging
    res.json(rows);
  } catch (error) {
    console.error("Error fetching players:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

app.post("/insertUnmatchedBatting", async (req, res) => {
  const { category, format, unmatchedPlayers } = req.body;

  try {
    // Prepare the query dynamically
    const battingQuery = `
      INSERT INTO player (player_name, team, buy, sell, role, runs, strikerate, wicket, economy, category, format)
      VALUES ${unmatchedPlayers
        .map(
          (_, i) =>
            `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, 
            $${i * 11 + 5}, $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, 
            $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11})`
        )
        .join(", ")}
    `;

    const battingValues = unmatchedPlayers.flatMap((player) => [
      player.name,
      player.team,
      0, // Default buy value
      0, // Default sell value
      player.role,
      player.run,
      player.strikerate,
      "0", // Default Wickets (assuming integer)
      "0", // Default Economy (assuming float)
      category,
      format,
    ]);

    await conn.query(battingQuery, battingValues);
    res.json({ message: "Player data inserted successfully!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/updateMatchedBatting", async (req, res) => {
  try {
    const { matchedPlayers } = req.body;

    if (!matchedPlayers || matchedPlayers.length === 0) {
      return res.status(400).json({ error: "No players to update" });
    }

    for (const player of matchedPlayers) {
      // Fetch the old values
      const oldData = await conn.query(
        "SELECT runs, strikerate ,wicket,economy,team FROM player WHERE player_id = $1",
        [player.player_id]
      );

      if (oldData.rows.length === 0) {
        console.log(`Player ID ${player.player_id} not found.`);
        continue; // Skip if no record found
      }

      const oldRuns = oldData.rows[0].runs || "0";
      const oldStrikeRate = oldData.rows[0].strikerate || "0";
      const oldwicket = oldData.rows[0].wicket || "0";
      const oldeconomy = oldData.rows[0].economy || "0";

      const newRuns = `${oldRuns},${player.run}`;
      const newStrikeRate = `${oldStrikeRate},${player.strikerate}`;
      const newwicket = `${oldwicket},0`;
      const neweconomy = `${oldeconomy},0`;
      const team = `${player.team}`;

      // Update the database
      await conn.query(
        "UPDATE player SET runs = $1, strikerate = $2 ,wicket=$3,economy=$4,team=$5 WHERE player_id = $6",
        [newRuns, newStrikeRate, newwicket, neweconomy, team, player.player_id]
      );
    }

    res.json({ message: "Matched players updated successfully" });
  } catch (error) {
    console.error("Error updating matched players:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/insertUnmatchedBowling", async (req, res) => {
  const { category, format, unmatchedPlayers } = req.body;

  try {
    // Insert Bowling Data with Runs & Strike Rate
    const bowlingQuery = `
      INSERT INTO player (player_name, team, buy, sell, role, runs, strikerate, wicket, economy, category, format)
      VALUES ${unmatchedPlayers
        .map(
          (_, i) =>
            `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, 
            $${i * 11 + 5}, $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, 
            $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11})`
        )
        .join(", ")}
    `;

    const bowlingValues = unmatchedPlayers.flatMap((player) => [
      player.name,
      player.team,
      0, // Default buy value
      0, // Default sell value
      player.role,
      "0", // Runs (if available, otherwise 0)
      "0", // Strike Rate (if available, otherwise 0)
      player.wicket, // Wickets
      player.economy, // Economy
      category,
      format,
    ]);

    await conn.query(bowlingQuery, bowlingValues);
    res.json({ message: "Bowling player data inserted successfully!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/updateMatchedBowling", async (req, res) => {
  try {
    const { matchedPlayers } = req.body;

    if (!matchedPlayers || matchedPlayers.length === 0) {
      return res.status(400).json({ error: "No players to update" });
    }

    for (const player of matchedPlayers) {
      // Fetch the old values
      const oldData = await conn.query(
        "SELECT strikerate ,runs,wicket, economy FROM player WHERE player_id = $1",
        [player.player_id]
      );

      if (oldData.rows.length === 0) {
        console.log(`Player ID ${player.player_id} not found.`);
        continue; // Skip if no record found
      }
      const oldStrikeRate = oldData.rows[0].strikerate || "0";
      const oldruns = oldData.rows[0].runs || "0";
      const oldWickets = oldData.rows[0].wicket || "0";
      const oldEconomy = oldData.rows[0].economy || "0";

      // Format new values
      const newStrikeRate = `${oldStrikeRate},0`;
      const newruns = `${oldruns},0`;
      const newWickets = `${oldWickets},${player.wicket}`;
      const newEconomy = `${oldEconomy},${player.economy}`;
      const team = `${player.team}`;

      // Update the database
      await conn.query(
        "UPDATE player SET runs = $1, strikerate = $2 ,wicket=$3,economy=$4,team=$5 WHERE player_id = $6",
        [newruns, newStrikeRate, newWickets, newEconomy, team, player.player_id]
      );
    }

    res.json({ message: "Matched bowling players updated successfully" });
  } catch (error) {
    console.error("Error updating matched bowling players:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/insertUnmatchedBatting_Bowling", async (req, res) => {
  const { category, format, unmatchedPlayers } = req.body;

  try {
    const query = `
      INSERT INTO player (player_name, team, buy, sell, role, runs, strikerate, wicket, economy, category, format)
      VALUES ${unmatchedPlayers
        .map(
          (_, i) =>
            `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, 
            $${i * 11 + 5}, $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, 
            $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11})`
        )
        .join(", ")}
    `;

    const values = unmatchedPlayers.flatMap((player) => [
      player.name,
      player.team,
      0, // Default buy value
      0, // Default sell value
      player.role,
      player.run,
      player.strikerate,
      player.wicket, // Include wickets for all-rounders
      player.economy, // Include economy for all-rounders
      category,
      format,
    ]);

    await conn.query(query, values);
    res.json({ message: "Batting_Bowling players inserted successfully!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/updateMatchedBatting_Bowling", async (req, res) => {
  try {
    const { matchedPlayers } = req.body;

    if (!matchedPlayers || matchedPlayers.length === 0) {
      return res.status(400).json({ error: "No players to update" });
    }

    for (const player of matchedPlayers) {
      // Fetch old values
      const oldData = await conn.query(
        "SELECT runs, strikerate, wicket, economy FROM player WHERE player_id = $1",
        [player.player_id]
      );

      if (oldData.rows.length === 0) {
        console.log(`Player ID ${player.player_id} not found.`);
        continue; // Skip if no record found
      }

      const oldRuns = oldData.rows[0].runs || "0";
      const oldStrikeRate = oldData.rows[0].strikerate || "0";
      const oldWickets = oldData.rows[0].wicket || "0";
      const oldEconomy = oldData.rows[0].economy || "0";

      // Append new values
      const newRuns = `${oldRuns},${player.run}`;
      const newStrikeRate = `${oldStrikeRate},${player.strikerate}`;
      const newWickets = `${oldWickets},${player.wicket}`;
      const newEconomy = `${oldEconomy},${player.economy}`;
      const team = `${player.team}`;

      // Update the database
      await conn.query(
        "UPDATE player SET runs = $1, strikerate = $2, wicket = $3, economy = $4,team=$5 WHERE player_id = $6",
        [newRuns, newStrikeRate, newWickets, newEconomy, team, player.player_id]
      );
    }

    res.json({
      message: "Matched Batting_Bowling players updated successfully",
    });
  } catch (error) {
    console.error("Error updating Batting_Bowling players:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/players", (req, res) => {
  const {
    player_name,
    team,
    buy,
    sell,
    role,
    runs,
    strikerate,
    wicket,
    economy,
    category,
    format,
  } = req.body;

  const insert_query =
    "insert into player (player_name, team, buy, sell, role, runs,strikerate,wicket, economy,category,format) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)";
  conn.query(
    insert_query,
    [
      player_name,
      team,
      buy,
      sell,
      role,
      runs,
      strikerate,
      wicket,
      economy,
      category,
      format,
    ],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
        res.send("data save");
      }
    }
  );
});

app.get("/readplayers", (req, res) => {
  const read_query = "select * from player";
  conn.query(read_query, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result.rows);
    }
  });
});

app.put("/updatematch/:player_id", (req, res) => {
  const player_id = Number(req.params.player_id); // Ensure it's a number

  const {
    player_name,
    role,
    team,
    buy,
    sell,
    runs,
    strikerate,
    wicket,
    economy,
  } = req.body;

  const update_query = `
    UPDATE player 
    SET player_name = $1, role = $2, team = $3, buy = $4, sell = $5, 
        runs = $6, strikerate = $7, wicket = $8, economy = $9 
    WHERE player_id = $10
  `;

  conn.query(
    update_query,
    [
      player_name,
      role,
      team,
      buy,
      sell,
      runs,
      strikerate,
      wicket,
      economy,
      player_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating player:", err);
        res.status(500).json({ message: "Error updating player", error: err });
      } else {
        res.status(200).json({ message: "Player updated successfully" });
      }
    }
  );
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
