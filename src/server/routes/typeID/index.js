"use strict";
const handler = require("./handler");

module.exports = {
  name: "typeID",
  version: "1.0.0",
  register: async function (server, options) {
    server.route({
      method: "GET",
      path: "/api/blueprint",
      handler: handler(server, options)
    });
  }
};
