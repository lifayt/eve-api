"use strict";
const retrieveBlueprint = require("../../database/retrieveBlueprints");
const formatBlueprint = require("../../formatters/formatBlueprint");

module.exports = (server, options) => {
  return async (request, h) => {
    const params = request.query;
    const typeID = params.typeID;
    const materialEfficiency = params.materialEfficiency;
    const stationBonus = params.stationBonus;
    const runs = params.runs;
    const blueprint = await retrieveBlueprint(options.connection, typeID);
    const formattedBlueprint = formatBlueprint(
      blueprint,
      materialEfficiency,
      stationBonus,
      runs
    );

    return formattedBlueprint;
  };
};
