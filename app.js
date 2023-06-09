const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");
const initiateBDAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initiateBDAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//1
app.get("/player/", async (request, response) => {
  const allPlayersSql = `
    SELECT *
    FROM cricket_team;
    `;
  const allPlayers = await db.all(allPlayersSql);
  response.send(
    allPlayers.map((each) => convertDbObjectToResponseObject(each))
  );
});
//2
app.post("/player/", async (request, response) => {
  console.log(request.body);
  let { playerName, jerseyNumber, role } = request.body;
  const postPlayerSql = `
  INSERT INTO
  cricket_team(player_name, jersey_number, role)
  values(
      '${playerName}',
      ${jerseyNumber},
      '${role}'
      );
  `;
  let postPlayer = await db.run(postPlayerSql);
  response.send("Player Added to Team");
});
//3
app.get("/player/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  const getPlayerSql = `
    SELECT *
    FROM
      cricket_team
    WHERE
      player_id  = ${playerId};
    `;
  let getPlayer = await db.get(getPlayerSql);
  response.send(getPlayer);
});
//4
app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { playerName, jerseyNumber, role } = request.body;
  console.log(request.body);
  let putPlayerSql = `
  UPDATE 
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id=${playerId};
  `;
  const putPlayer = await db.run(putPlayerSql);
  response.send("Player Details Updated");
});
//5
app.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let delPlayerSql = `
  DELETE FROM 
    cricket_team
  WHERE 
    player_id=${playerId};
    `;
  let deletePlayer = await db.run(delPlayerSql);
  response.send("Player Removed");
});
module.exports = app;
