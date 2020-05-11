"use strict";
const mysql = require("mysql");
const fs = require("fs");
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

const getPrice = async (typeID) => {
  return new Promise((resolve, reject) => {
    const options = {
      sql:
        "select * from `eve-prices`.Prices where typeID = ? AND region = 10000002 AND isBuyOrder = 'false'"
    };
    connection.query(options, [typeID], function (error, results, fields) {
      if (error) reject(error);
      resolve(results);
    });
  });
};

const retrieveBlueprint = async (typeID) => {
  try {
    const options = {
      sql:
        "SELECT industryBlueprints.typeID, blueprint.typeName, productTypeID, product.typeName, industryActivityProducts.quantity, materialTypeID, material.typeName, industryActivityMaterials.quantity FROM industryBlueprints INNER JOIN invTypes AS blueprint ON industryBlueprints.typeID = blueprint.typeID INNER JOIN industryActivityProducts ON industryBlueprints.typeID = industryActivityProducts.typeID INNER JOIN invTypes AS product ON industryActivityProducts.productTypeID = product.typeID INNER JOIN industryActivityMaterials ON industryActivityMaterials.typeID = industryBlueprints.typeID INNER JOIN invTypes AS material ON industryActivityMaterials.materialTypeID = material.typeID WHERE industryActivityMaterials.activityID = 1 AND industryActivityProducts.activityID = 1 AND industryActivityProducts.productTypeID = ? ORDER BY typeID asc",
      nestTables: "_"
    };

    console.log(`Fetching Blueprint for typeID: ${typeID}`);

    const results = await new Promise((resolve, reject) => {
      connection.query(options, [typeID], function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      });
    });

    const materials = await Promise.all(
      results.map(async (result) => {
        const prices = await getPrice(
          result.industryActivityMaterials_materialTypeID
        );
        return {
          typeID: result.industryActivityMaterials_materialTypeID,
          name: result.material_typeName,
          quantity: result.industryActivityMaterials_quantity,
          price: prices[0].fivePercent
        };
      })
    );

    console.log(
      `Fetching Price for product: ${results[0].industryActivityProducts_productTypeID} - ${results[0].product_typeName}`
    );

    const productPrice = await getPrice(
      results[0].industryActivityProducts_productTypeID
    );

    const unitPrice = parseFloat(productPrice[0].fivePercent);

    const totalMaterialsCost = materials.reduce((accumulator, material) => {
      const materialPrice =
        parseFloat(material.price) * parseFloat(material.quantity);
      return accumulator + materialPrice;
    }, parseFloat(materials[0].price));

    const unitProductionPrice =
      totalMaterialsCost / results[0].industryActivityProducts_quantity;

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
      typeID: results[0].industryBlueprints_typeID,
      name: results[0].blueprint_typeName,
      produces: {
        typeID: results[0].industryActivityProducts_productTypeID,
        name: results[0].product_typeName,
        price: productPrice[0].fivePercent,
        quantity: results[0].industryActivityProducts_quantity
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
