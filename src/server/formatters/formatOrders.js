"use strict";
const get = require("lodash.get");
const formatIsk = require("./formatIsk");

module.exports = (blueprints) => {
  let shoppingList = {};
  let totalExpectedExpense = 0;
  let totalExpectedRevenue = 0;
  blueprints.forEach((blueprint) => {
    console.log(`Formatting for ${blueprint.typeName}`);
    console.log(blueprint);
    blueprint.materials.forEach((material) => {
      if (shoppingList[material.materialName]) {
        shoppingList[material.materialName].totalMaterialQuantity +=
          material.totalMaterialQuantity;
        shoppingList[material.materialName].expectedTotalMaterialCost +=
          material.totalRunCost;

        totalExpectedExpense += material.totalRunCost;
      } else {
        shoppingList[material.materialName] = {
          totalMaterialQuantity: material.totalMaterialQuantity,
          expectedTotalMaterialCost: material.totalRunCost
        };

        totalExpectedExpense += material.totalRunCost;
      }
    });
    totalExpectedRevenue += blueprint.priceAnalysis.expectedRevenue;
  });
  return {
    blueprints,
    shoppingList,
    totalExpectedExpense: formatIsk(totalExpectedExpense),
    totalExpectedRevenue: formatIsk(totalExpectedRevenue),
    totalExpectedProfit: formatIsk(totalExpectedRevenue - totalExpectedExpense)
  };
};
