const Spinner = require("cli-spinner").Spinner;
const spinObj = new Spinner("processing.. %s");
spinObj.setSpinnerString("|/-\\");

const terminal = {
  log: (...args) => console.log("→", ...args),
  spinner: spinObj
};
module.exports = terminal;
