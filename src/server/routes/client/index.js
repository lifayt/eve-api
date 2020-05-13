"use strict";

module.exports = {
  name: "client",
  version: "1.0.0",
  register: async function (server, options) {
    server.route({
      method: "GET",
      path: "/{file*}",
      handler: {
        directory: {
          path: `${__dirname}/../../../../dist/`,
          index: ["index.html"]
        }
      }
    });
  }
};
