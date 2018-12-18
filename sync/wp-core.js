const _ = require('lodash');
const fs = require('fs');
const writeStream = fs.createWriteStream(__dirname + '/../lists/wp.txt');
const pathName = writeStream.path.replace('../', '');
const htmlToJson = require('html-to-json');

const base2fetch = [
    ["https://developer.wordpress.org/reference/functions/", 101],
    ["https://developer.wordpress.org/reference/hooks/", 73],
    ["https://developer.wordpress.org/reference/classes/", 12],
    ["https://developer.wordpress.org/reference/methods/", 104]
  ];
const promises = [];

const generateFetchURL = (i, e) => {
  return e + (i > 1 ? 'page/' + i : '');
};

const linkParser = htmlToJson.createParser(['main article h1', {
  'func': $el => $el.find('a[href]').text().trim(),
  'method': $el => $el.next().find('> p').text()
}]);

const pageParser = url => {
  return new Promise((resolve, reject) => {
    linkParser.request(url).then(links => {
      resolve(links);
    })
    .catch(e => {
      reject(e);
    })
  });
}

for(fetchUrl of base2fetch) {
  let l = fetchUrl[0].split('/');
  console.log("Creating Promises for WP " + l[l.length - 2]);
  for(let i = 1; i <= fetchUrl[1]; i++) {
    promises.push( pageParser( generateFetchURL(i, fetchUrl[0]) ) );
  }
}

console.log("Loading " + promises.length + " pages");
const timerStart = Date.now();

Promise.all(promises).then(values => {
  let functions = _.flatten(values);
  for(f in functions) {
    writeStream.write(functions[f].func + "\n");
  }

  console.log("Loaded in " + (Date.now() - timerStart) / 1000 + " seconds");

  writeStream.on('finish', () => {
    console.log(`WP Core Sync complete. Saved to ${pathName}`);
  });

  writeStream.on('error', (err) => {
    console.error(`There is an error writing the file ${pathName} => ${err}`)
  });

  writeStream.end();
});