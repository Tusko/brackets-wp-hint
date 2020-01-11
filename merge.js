const mergeFiles = require("merge-files");
const terminal = require("./terminal");

const inputPathList = [
  __dirname + "/lists/wp.txt",
  __dirname + "/lists/acf.txt",
  __dirname + "/lists/woocommerce.txt"
];

// console.log(__dirname);

mergeFiles(inputPathList, __dirname + "/result.txt").then(status => {
  if (status) {
    terminal.log("All Wordpress/ACF/WooCommerce functions up to date.");
  } else {
    terminal.log("🐞 ", "Error. Please check input files");
  }
});
