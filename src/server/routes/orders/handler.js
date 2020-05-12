"use strict";
const retrieveBlueprint = require("../../database/retrieveBlueprints");
const formatBlueprint = require("../../formatters/formatBlueprint");
const formatOrders = require("../../formatters/formatOrders");

module.exports = (server, options) => {
  return async (request, h) => {
    const orders = request.payload;
    const blueprints = await Promise.all(
      orders.map(async (order) => {
        const rows = await retrieveBlueprint(options.connection, order.typeID);
        return formatBlueprint(
          rows,
          order.materialEfficiency,
          order.stationBonus,
          order.runs
        );
      })
    );

    const formattedOrders = formatOrders(blueprints);

    return `${JSON.stringify(formattedOrders, null, 2)}`;
  };
};
