"use strict";
const get = require("lodash.get");
const formatIsk = require("./formatIsk");

const nullsecSotiyoBonus = 0.958;

const formatMaterials = (rows, materialEfficiency, stationBonus, runs) => {
  return rows.map((row) => {
    const { materialTypeID, materialName, materialQuantity } = row;

    const adjustedMaterialQuantity = Math.ceil(
      Math.max(
        materialQuantity *
          ((100 - materialEfficiency) / 100) *
          stationBonus *
          nullsecSotiyoBonus,
        1
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
        materialQuantity *
          ((100 - materialEfficiency) / 100) *
          stationBonus *
          nullsecSotiyoBonus,
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

module.exports = (
  rows,
  materialEfficiency = 10,
  stationBonus = 0.99,
  runs = 1
) => {
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
    productName,
    productParentGroupId,
    productParentGroupName,
    productMarketGroupID,
    productMarketGroupName
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

  const adjustedTotalRunCost = adjustedTotalMaterialCost * runs;

  const expectedRevenue = unitPrice * productQuantity * runs;
  const adjustedRevenue =
    expectedRevenue - expectedRevenue * 0.028 - expectedRevenue * 0.035;

  const baseExpectedProfit = expectedRevenue - baseTotalRunCost;
  const adjustedExpectedProfit = adjustedRevenue - adjustedTotalRunCost;

  const priceAnalysis = {
    productName,
    unitPrice: formatIsk(unitPrice),
    expectedRevenue,
    adjustedRevenue,
    baseTotalMaterialCost: formatIsk(baseTotalMaterialCost),
    baseUnitProductionPrice: formatIsk(baseUnitProductionPrice),
    baseUnitProfit: formatIsk(baseUnitProfit),
    baseExpectedProfit: formatIsk(baseExpectedProfit),
    baseProfitMargin,
    adjustedTotalMaterialCost: formatIsk(adjustedTotalMaterialCost),
    adjustedUnitProductionPrice: formatIsk(adjustedUnitProductionPrice),
    adjustedUnitProfit: formatIsk(adjustedUnitProfit),
    adjustedExpectedProfit: formatIsk(adjustedExpectedProfit),
    adjustedExpectedProfitRaw: adjustedExpectedProfit,
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
      productQuantity,
      productParentGroupId,
      productParentGroupName,
      productMarketGroupID,
      productMarketGroupName
    },
    materials,
    priceAnalysis
  };

  return resultObject;
};
