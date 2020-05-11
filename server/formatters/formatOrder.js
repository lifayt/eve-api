"use strict";
const get = require("lodash.get");

module.exports = (blueprint, materialEfficiency, stationBonus, runs) => {
  const productOutputVolume = blueprint.produces.productQuantity * runs;

  return {
    blueprint.blueprintTypeId,
    blueprint.blueprintName
  };
};
