"use strict";

module.exports = async (connection, typeID) => {
  try {
    const options = {
      sql:
        "SELECT * FROM `eve-prices`.v_blueprintretrieval WHERE productTypeID = ?"
    };

    console.log(`Fetching Blueprint for typeID: ${typeID}`);

    return await new Promise((resolve, reject) => {
      connection.query(options, [typeID], function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      });
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};
