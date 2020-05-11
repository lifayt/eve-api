"use strict";
const mysql = require("mysql");
const fs = require("fs");
const retrieveBlueprint = require("../server/database/retrieveBlueprints");
const formatBlueprint = require("../server/formatters/formatBlueprint");
require("dotenv").config();

const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: "eve"
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

const generateOrder = async (
  typeId,
  materialEfficiency,
  stationBonus,
  runs
) => {
  const rows = await retrieveBlueprint(connection, typeId);
  const order = formatBlueprint(rows, materialEfficiency, stationBonus, runs);
  return order;
};

const run = async () => {
  //retrieveAllBlueprints();
  const results = await retrieveBlueprint(connection, "185");
  console.log(formatBlueprint(results, 10, 0.99, 2));

  connection.end(function (error) {
    if (error) throw error;
  });
};

run();
