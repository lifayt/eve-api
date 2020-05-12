"use strict";
const csv = require("csv-parser");
const fs = require("fs");
const results = [];
const path = `${__dirname}/../data/aggregatecsv.csv`;
const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

const insertIntoMySql = (results) => {
  try {
    results.forEach((result) => {
      const date = new Date().toISOString();
      connection.query(
        "INSERT INTO `eve-prices`.Prices (fivePercent, isBuyOrder, itemID, maximumValue, median, minimumValue, numOrders, orderSet, region, stdDev, timeUpdated, typeID, volume, weightedAverage) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE fivePercent=?, isBuyOrder=?, itemID=?, maximumValue=?, median=?, minimumValue=?, numOrders=?, orderSet=?, region=?, stdDev=?, timeUpdated=?, typeID=?, volume=?, weightedAverage=?",
        [
          parseFloat(result.fivepercent),
          result.what.isBuyOrder,
          result.what.itemID,
          parseFloat(result.maxval),
          parseFloat(result.median),
          parseFloat(result.minval),
          parseInt(result.numorders),
          parseInt(result.orderSet),
          parseInt(result.what.region),
          parseFloat(result.stddev),
          date,
          parseInt(result.what.typeID),
          parseInt(result.volume),
          parseFloat(result.weightedaverage),
          parseFloat(result.fivepercent),
          result.what.isBuyOrder,
          result.what.itemID,
          parseFloat(result.maxval),
          parseFloat(result.median),
          parseFloat(result.minval),
          parseInt(result.numorders),
          parseInt(result.orderSet),
          parseInt(result.what.region),
          parseFloat(result.stddev),
          date,
          parseInt(result.what.typeID),
          parseInt(result.volume),
          parseFloat(result.weightedaverage)
        ],
        function (error, results, fields) {
          if (error) throw error;
          console.log(results);
        }
      );
    });

    connection.end(function (err) {
      if (err) throw err;
    });
  } catch (e) {
    console.log(`Error inserting data: ${e}`);
  }
};

const importAggregateMarketData = () => {
  fs.createReadStream(path)
    .pipe(
      csv({
        mapValues: ({ header, index, value }) => {
          if (header === "what") {
            const keys = value.split("|");
            return {
              itemID: value,
              region: keys[0],
              typeID: keys[1],
              isBuyOrder: keys[2]
            };
          } else {
            return value;
          }
        }
      })
    )
    .on("data", (data) => results.push(data))
    .on("end", () => {
      //console.log(results);
      insertIntoMySql(results);
    });
};

importAggregateMarketData();
