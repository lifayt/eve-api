"use strict";
const mysql = require("mysql");
const fs = require("fs");
const retrieveBlueprint = require("../server/database/retrieveBlueprintByBlueprint");
const formatBlueprint = require("../server/formatters/formatBlueprint");
const formatOrders = require("../server/formatters/formatOrders");
const order = require("./order.js");
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
  const orders = await generateOrders(order);

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
