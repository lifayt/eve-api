"use strict";
const mysql = require("mysql");
const fs = require("fs");
const formatIsk = require("../server/formatters/formatIsk");
const formatBlueprint = require("../server/formatters/formatBlueprint");
const groupBy = require("../server/utils/groupBy");
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
      "SELECT * FROM `eve-prices`.v_blueprintretrieval",
      function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      }
    );
  });

  const groupedBlueprints = groupBy(results, "productTypeID");

  const blueprintKeys = Object.keys(groupedBlueprints);

  const analyses = blueprintKeys.map((blueprintKey) => {
    const blueprint = groupedBlueprints[blueprintKey];

    console.log(
      `Formatting Blueprint for Product: ${blueprint[0].productTypeID} - ${blueprint[0].productName}`
    );
    const formattedAnalysis = formatBlueprint(blueprint);
    try {
      return {
        blueprintTypeID: formattedAnalysis.blueprintTypeID,
        blueprintName: formattedAnalysis.blueprintName,
        productTypeID: formattedAnalysis.produces.productTypeID,
        productName: formattedAnalysis.produces.productName,
        productParentGroupName:
          formattedAnalysis.produces.productParentGroupName,
        priceAnalysis: formattedAnalysis.priceAnalysis
      };
    } catch (e) {
      return {};
    }
  });

  const groupedAnalyses = groupBy(analyses, "productParentGroupName");

  const productGroupKeys = Object.keys(groupedAnalyses);
  productGroupKeys.forEach((productGroupKey) => {
    const productGroup = groupedAnalyses[productGroupKey];
    const filteredResultSet = productGroup.filter((value) => value !== null);
    try {
      filteredResultSet.sort((a, b) => {
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
    } catch (e) {}

    fs.writeFileSync(
      `${__dirname}/../data/analyses/${productGroupKey}.json`,
      JSON.stringify(filteredResultSet, null, 2)
    );
  });
};

const run = async () => {
  await retrieveAllBlueprints();
  //const results = await retrieveBlueprint(connection, "12791");
  //console.log(formatBlueprint(results));

  connection.end(function (error) {
    if (error) throw error;
  });
};

run();
