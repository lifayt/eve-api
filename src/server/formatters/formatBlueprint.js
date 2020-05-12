"use strict";
const get = require("lodash.get");
const formatIsk = require("./formatIsk");

const formatMaterials = (rows, materialEfficiency, stationBonus, runs) => {
  return rows.map((row) => {
    const { materialTypeID, materialName, materialQuantity } = row;

    const adjustedMaterialQuantity = Math.max(
      Math.ceil(
        materialQuantity * ((100 - materialEfficiency) / 100) * stationBonus
      )
    );

    const materialBasePrice = parseFloat(get(row, "materialBasePrice", 0));
    const materialPrice = parseFloat(
      get(row, "materialFivePercent", materialBasePrice)
    );

    const baseMaterialRunCost = materialPrice * materialQuantity;
    const adjustedMaterialRunCost = materialPrice * adjustedMaterialQuantity;

    const totalMaterialQuantity = Math.ceil(
      Math.max(
        materialQuantity * ((100 - materialEfficiency) / 100) * stationBonus,
        1
      ) * runs
    );
    const totalRunCost = adjustedMaterialRunCost * runs;

    return {
      materialTypeID,
      materialName,
      materialPrice,
      baseMaterialQuantity: materialQuantity,
      baseMaterialRunCost,
      adjustedMaterialQuantity,
      adjustedMaterialRunCost,
      totalMaterialQuantity,
      totalRunCost
    };
  });
};

module.exports = (rows, materialEfficiency = 1, stationBonus = 1, runs = 1) => {
  if (rows.length === 0) {
    return {};
  }

  const productFivePercent = get(
    rows[0],
    "productFivePercent",
    rows[0].productBasePrice
  );

  const {
    productQuantity,
    productSellVolume,
    productNumOrders,
    blueprintTypeID,
    blueprintName,
    productTypeID,
    productName
  } = rows[0];

  const materials = formatMaterials(
    rows,
    materialEfficiency,
    stationBonus,
    runs
  );

  const unitPrice = parseFloat(productFivePercent);

  const baseTotalMaterialCost = materials.reduce((accumulator, material) => {
    return accumulator + material.baseMaterialRunCost;
  }, get(rows[0], "baseMaterialRunCost", 0));

  const baseUnitProductionPrice =
    baseTotalMaterialCost / parseInt(productQuantity);

  const baseUnitProfit = unitPrice - baseUnitProductionPrice;

  const baseProfitMargin = (baseUnitProfit / baseUnitProductionPrice) * 100;

  const adjustedTotalMaterialCost = materials.reduce(
    (accumulator, material) => {
      return accumulator + material.adjustedMaterialRunCost;
    },
    get(rows[0], "adjustedMaterialRunCost", 0)
  );

  const adjustedUnitProductionPrice =
    adjustedTotalMaterialCost / parseInt(productQuantity);

  const adjustedUnitProfit = unitPrice - adjustedUnitProductionPrice;

  const adjustedProfitMargin =
    (adjustedUnitProfit / adjustedUnitProductionPrice) * 100;

  const baseTotalRunCost = baseTotalMaterialCost * runs;

  const adjustedtotalRunCost = adjustedTotalMaterialCost * runs;

  const expectedRevenue = unitPrice * productQuantity * runs;
  const baseExpectedProfit = expectedRevenue - baseTotalRunCost;
  const adjustedExpectedProfit = expectedRevenue - adjustedtotalRunCost;

  const priceAnalysis = {
    productName,
    unitPrice: formatIsk(unitPrice),
    expectedRevenue,
    baseTotalMaterialCost: formatIsk(baseTotalMaterialCost),
    baseUnitProductionPrice: formatIsk(baseUnitProductionPrice),
    baseUnitProfit: formatIsk(baseUnitProfit),
    baseExpectedProfit: formatIsk(baseExpectedProfit),
    baseProfitMargin,
    adjustedTotalMaterialCost: formatIsk(adjustedTotalMaterialCost),
    adjustedUnitProductionPrice: formatIsk(adjustedUnitProductionPrice),
    adjustedUnitProfit: formatIsk(adjustedUnitProfit),
    adjustedExpectedProfit: formatIsk(adjustedExpectedProfit),
    adjustedProfitMargin,
    productSellVolume: parseInt(productSellVolume),
    productNumOrders: parseInt(productNumOrders)
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
};
