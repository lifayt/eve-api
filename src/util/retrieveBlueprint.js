"use strict";
const mysql = require("mysql");
const fs = require("fs");
const retrieveBlueprint = require("../server/database/retrieveBlueprints");
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
      "select * from `eve-prices`.v_blueprintsByMarketGroup ORDER BY `eve-prices`.v_blueprintsByMarketGroup.parentGroupName asc LIMIT 50",
      function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      }
    );
  });

  const groupedBlueprints = groupBy(results, "parentGroupName");

  const marketGroups = Object.keys(groupedBlueprints);

  const fetchMarketGroupBlueprints = async (marketGroup) => {
    const blueprintGroup = await Promise.all(
      marketGroup.map(async (blueprint) => {
        console.log(
          `Querying Blueprint for Product: ${blueprint.productTypeID} - ${blueprint.typeName}`
        );
        const analysis = await retrieveBlueprint(
          connection,
          blueprint.productTypeID
        );
        console.log(
          `Formatting Blueprint for Product: ${blueprint.productTypeID} - ${blueprint.typeName}`
        );
        const formattedAnalysis = formatBlueprint(analysis);
        return formattedAnalysis;
      })
    );

    return blueprintGroup;
  };

  const analyses = await Promise.all(
    marketGroups.map(async (marketGroup) => {
      const blueprints = groupedBlueprints[marketGroup];
      return await fetchMarketGroupBlueprints(blueprints);
    })
  );

  console.log(analyses);

  /*
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
  */
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
