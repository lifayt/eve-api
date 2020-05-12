"use strict";
const handler = require("./handler");

const orders = {
  name: "orders",
  version: "1.0.0",
  register: async function (server, options) {
    server.route({
      method: "POST",
      path: "/api/orders",
      handler: handler(server, options)
    });
  }
};

module.exports = orders;
