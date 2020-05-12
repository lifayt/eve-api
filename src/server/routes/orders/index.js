"use strict";
const handler = require("./handler");

module.exports = {
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
