module.exports = (value) => {
  return new Intl.NumberFormat("en-IS", {
    style: "currency",
    currency: "ISK",
    maximumSignificantDigits: 4
  }).format(value);
};
