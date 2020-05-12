"use strict";

const Hapi = require("@hapi/hapi");
const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: "eve"
});

const typeID = require("./src/server/routes/typeID/");
const orders = require("./src/server/routes/orders/");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost"
  });

  connection.connect(function (err) {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }

    console.log("connected as id " + connection.threadId);
  });

  await server.register([
    {
      plugin: typeID,
      options: {
        connection
      }
    },
    {
      plugin: orders,
      options: {
        connection
      }
    }
  ]);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  connection.end(function (err) {
    if (err) throw err;
  });
  console.log(err);
  process.exit(1);
});

init();
