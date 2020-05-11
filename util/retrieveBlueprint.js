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

const retrieveAllBlueprints = async () => {
  const results = await new Promise((resolve, reject) => {
    connection.query(
      "SELECT productTypeID FROM industryBlueprints INNER JOIN invTypes AS blueprints ON industryBlueprints.typeID = blueprints.typeID INNER JOIN industryActivityProducts ON industryBlueprints.typeID = industryActivityProducts.typeID INNER JOIN invTypes AS products ON industryActivityProducts.productTypeID = products.typeID WHERE industryActivityProducts.activityID = 1 ORDER BY industryBlueprints.typeID asc",
      function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      }
    );
  });

  const analyses = await Promise.all(
    results.map(async (result) => {
      console.log(`Querying Blueprint for Product: ${result.productTypeID}`);
      const blueprint = await retrieveBlueprint(result.productTypeID);
      return blueprint;
    })
  );

  const filteredResultSet = analyses.filter((value) => value !== null);

  filteredResultSet.sort((a, b) => {
    if (a.priceAnalysis.profitMargin < b.priceAnalysis.profitMargin) {
      return 1;
    }
    if (a.priceAnalysis.profitMargin > b.priceAnalysis.profitMargin) {
      return -1;
    }
    return 0;
  });

  fs.writeFileSync(
    `${__dirname}/../data/analyses.json`,
    JSON.stringify(filteredResultSet)
  );
};

const run = async () => {
  //retrieveAllBlueprints();
  const results = await retrieveBlueprint(connection, "185");
  console.log(formatBlueprint(results));

  connection.end(function (error) {
    if (error) throw error;
  });
};

run();
