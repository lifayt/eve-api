"use strict";
const mysql = require("mysql");
const fs = require("fs");
const get = require("lodash.get");
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

const retrieveBlueprint = async (typeID) => {
  try {
    const options = {
      sql:
        "SELECT * FROM `eve-prices`.v_blueprintretrieval WHERE productTypeID = ?"
    };

    console.log(`Fetching Blueprint for typeID: ${typeID}`);

    const results = await new Promise((resolve, reject) => {
      connection.query(options, [typeID], function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      });
    });

    const materials = results.map((result) => {
      const {
        materialTypeID,
        materialName,
        materialQuantity,
        materialFivePercent
      } = result;
      return {
        materialTypeID,
        materialName,
        materialQuantity,
        materialFivePercent
      };
    });

    const {
      productFivePercent,
      productQuantity,
      blueprintTypeID,
      blueprintName,
      productTypeID,
      productName
    } = results[0];

    const unitPrice = parseFloat(productFivePercent);

    const totalMaterialsCost = results.reduce((accumulator, material) => {
      const materialBasePrice = get(material, "materialBasePrice", 0);
      const materialPrice = get(
        material,
        "materialFivePercent",
        materialBasePrice
      );
      const totalMaterialPrice =
        parseFloat(materialPrice) *
        parseFloat(get(material, "materialQuantity"));

      return accumulator + totalMaterialPrice;
    }, parseFloat(get(materials[0], "materialFivePercent", 0)));

    const unitProductionPrice = totalMaterialsCost / parseInt(productQuantity);

    const unitProfit = unitPrice - unitProductionPrice;

    const profitMargin = (unitProfit / unitProductionPrice) * 100;

    const priceAnalysis = {
      totalMaterialsCost,
      unitProductionPrice,
      unitPrice,
      unitProfit,
      profitMargin
    };

    const resultObject = {
      blueprintTypeID,
      blueprintName,
      produces: {
        productTypeID,
        productName,
        productFivePercent,
        productQuantity
      },
      materials,
      priceAnalysis
    };

    return resultObject;
  } catch (err) {
    console.log(err);
    return null;
  }
};

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

  connection.end(function (error) {
    if (error) throw error;
  });
};

retrieveAllBlueprints();

//retrieveBlueprint("185");
