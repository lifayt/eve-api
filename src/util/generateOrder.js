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
      typeID: "47273",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 10
    },
    {
      typeID: "49710",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 1
    },
    {
      typeID: "47270",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 1
    },
    {
      typeID: "11279",
      materialEfficiency: 10,
      stationBonus: 0.98,
      runs: 50
    },
    {
      typeID: "20138",
      materialEfficiency: 10,
      stationBonus: 0.98,
      runs: 70
    },
    {
      typeID: "501",
      materialEfficiency: 10,
      stationBonus: 0.98,
      runs: 70
    },
    {
      typeID: "499",
      materialEfficiency: 10,
      stationBonus: 0.98,
      runs: 70
    },
    {
      typeID: "1875",
      materialEfficiency: 10,
      stationBonus: 0.98,
      runs: 70
    },
    {
      typeID: "22889",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 3
    },
    {
      typeID: "34272",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 10
    },
    {
      typeID: "21559",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 3
    },
    {
      typeID: "34278",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 3
    },
    {
      typeID: "34288",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 1
    },
    {
      typeID: "34286",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 11
    },
    {
      typeID: "34276",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 10
    },
    {
      typeID: "34294",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 1
    },
    {
      typeID: "4383",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 25
    },
    {
      typeID: "23418",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 3
    },
    {
      typeID: "21491",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 3
    },
    {
      typeID: "12274",
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 214
    }
  ]);

  orders.blueprints.sort((a, b) => {
    if (
      a.priceAnalysis.adjustedExpectedProfitRaw <
      b.priceAnalysis.adjustedExpectedProfitRaw
    ) {
      return 1;
    }
    if (
      a.priceAnalysis.adjustedExpectedProfitRaw >
      b.priceAnalysis.adjustedExpectedProfitRaw
    ) {
      return -1;
    }
    return 0;
  });

  const shoppingListKeys = Object.keys(orders.shoppingList);
  let formattedShoppingList = "";
  shoppingListKeys.forEach((key) => {
    const shoppingListItem = orders.shoppingList[key];
    formattedShoppingList =
      formattedShoppingList +
      `${key} ${shoppingListItem.totalMaterialQuantity}\n`;
  });
  console.log("\n-----");
  console.log(formattedShoppingList);
  console.log("-----\n");

  const date = new Date().toISOString();

  fs.writeFileSync(
    `${__dirname}/../data/orders/${date}.json`,
    JSON.stringify(orders, null, 2)
  );

  connection.end(function (error) {
    if (error) throw error;
  });
};

run();
