const mergeFiles = require('merge-files');

const inputPathList = [
    __dirname + '/lists/wp.txt',
    __dirname + '/lists/acf.txt',
    __dirname + '/lists/woocommerce.txt'
];

console.log(__dirname);

mergeFiles(inputPathList, __dirname + '/result.txt').then((status) => {
  if(status) {
    console.log("All Wordpress/ACF/WooCommerce functiuons up to date.");
  } else {
    console.log("Error. Plerase check input files");
  }
});