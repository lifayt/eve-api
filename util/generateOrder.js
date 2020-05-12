"use strict";
const mysql = require("mysql");
const fs = require("fs");
const retrieveBlueprint = require("../server/database/retrieveBlueprints");
const formatBlueprint = require("../server/formatters/formatBlueprint");
const formatOrders = require("../server/formatters/formatOrders");
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

const generateOrders = async (orders) => {
  const blueprints = await Promise.all(
    orders.map(async (order) => {
      const rows = await retrieveBlueprint(connection, order.typeID);
      return formatBlueprint(
        rows,
        order.materialEfficiency,
        order.stationBonus,
        order.runs
      );
    })
  );

  return formatOrders(blueprints);
};

const run = async () => {
  const orders = await generateOrders([
    {
      typeID: "2603",
      materialEfficiency: 10,
      stationBonus: 0.99,
      runs: 600
    },
    {
      typeID: "257",
      materialEfficiency: 10,
      stationBonus: 0.99,
      runs: 600
    }
  ]);
  console.log(JSON.stringify(orders, null, 2));

  connection.end(function (error) {
    if (error) throw error;
  });
};

run();
