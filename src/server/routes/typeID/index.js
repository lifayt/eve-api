"use strict";
const handler = require("./handler");

const typeID = {
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

module.exports = typeID;
