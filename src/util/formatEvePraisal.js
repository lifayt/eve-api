const file = require("./orders/evepraisal.json");

const main = () => {
  const json = JSON.parse(file);
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

  fs.writeFileSync(
    `${__dirname}/orders/${date}.json`,
    JSON.stringify(orders, null, 2)
  );
};

main();
