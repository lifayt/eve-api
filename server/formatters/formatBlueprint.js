"use strict";
const get = require("lodash.get");

const formatMaterials = (rows) => {
  return rows.map((result) => {
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
};

module.exports = (rows) => {
  const {
    productFivePercent,
    productQuantity,
    productSellVolume,
    productNumOrders,
    blueprintTypeID,
    blueprintName,
    productTypeID,
    productName
  } = rows[0];

  const unitPrice = parseFloat(productFivePercent);

  const totalMaterialsCost = rows.reduce((accumulator, material) => {
    const materialBasePrice = get(material, "materialBasePrice", 0);
    const materialPrice = get(
      material,
      "materialFivePercent",
      materialBasePrice
    );
    const totalMaterialPrice =
      parseFloat(materialPrice) * parseFloat(get(material, "materialQuantity"));

    return accumulator + totalMaterialPrice;
  }, parseFloat(get(rows[0], "materialFivePercent", 0)));

  const unitProductionPrice = totalMaterialsCost / parseInt(productQuantity);

  const unitProfit = unitPrice - unitProductionPrice;

  const profitMargin = (unitProfit / unitProductionPrice) * 100;

  /*
      Return sell volume and order volume
    */
  const priceAnalysis = {
    totalMaterialsCost,
    unitProductionPrice,
    unitPrice,
    unitProfit,
    profitMargin,
    productSellVolume,
    productNumOrders
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
    materials: formatMaterials(rows),
    priceAnalysis
  };

  return resultObject;
};
