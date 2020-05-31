const json = require("./orders/evepraisal.json");
const fs = require("fs");

const main = () => {
  const order = [];
  const items = json.items;
  items.forEach((item) => {
    order.push({
      typeName: item.typeName,
      typeID: item.typeID,
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 1
    });
  });

  const date = new Date().toISOString();

  fs.writeFileSync(
    `${__dirname}/orders/${date}.json`,
    JSON.stringify(order, null, 2)
  );
};

main();
