const json = require("./orders/evepraisal.json");
const fs = require("fs");

const main = () => {
  const order = [];
  let items = json.items;
  items.forEach((item) => {
    order.push({
      typeName: item.typeName,
      typeID: item.typeID,
      materialEfficiency: 0,
      stationBonus: 0.98,
      runs: 1
    });
  });

  order.sort(function (a, b) {
    if (a.typeName < b.typeName) {
      return -1;
    }
    if (b.typeName > a.typeName) {
      return 1;
    }
    return 0;
  });

  const date = new Date().toISOString();

  fs.writeFileSync(
    `${__dirname}/orders/${date}.json`,
    JSON.stringify(order, null, 2)
  );
};

main();
