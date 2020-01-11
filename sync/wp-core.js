const _ = require("lodash");
const fs = require("fs");
const writeStream = fs.createWriteStream(__dirname + "/../lists/wp.txt");
const pathName = writeStream.path.replace("../", "");
const htmlToJson = require("html-to-json");
const terminal = require("../terminal");

const base2fetch = [
  ["https://developer.wordpress.org/reference/functions/", 101],
  ["https://developer.wordpress.org/reference/hooks/", 73],
  ["https://developer.wordpress.org/reference/classes/", 12],
  ["https://developer.wordpress.org/reference/methods/", 104]
];
const promises = [];

const generateFetchURL = (i, e) => {
  return e + (i > 1 ? "page/" + i : "");
};

const linkParser = htmlToJson.createParser([
  "main article h1",
  {
    func: $el =>
      $el
        .find("a[href]")
        .text()
        .trim(),
    method: $el =>
      $el
        .next()
        .find("> p")
        .text()
  }
]);

const pageParser = url => {
  return new Promise((resolve, reject) => {
    linkParser
      .request(url)
      .then(links => {
        resolve(links);
      })
      .catch(e => {
        reject(e);
      });
  });
};

for (fetchUrl of base2fetch) {
  let l = fetchUrl[0].split("/");

  terminal.log("⏱️ ", "Creating Promises for WP " + l[l.length - 2]);

  for (let i = 1; i <= fetchUrl[1]; i++) {
    promises.push(pageParser(generateFetchURL(i, fetchUrl[0])));
  }
}

terminal.log("🖨️ ", "Loading " + promises.length + " pages");
terminal.spinner.start();

const timerStart = Date.now();

Promise.all(promises).then(values => {
  let functions = _.flatten(values);
  for (f in functions) {
    writeStream.write(functions[f].func + "\n");
  }

  terminal.spinner.stop();
  terminal.log(
    "🧨 ",
    "Loaded in " + (Date.now() - timerStart) / 1000 + " seconds"
  );

  writeStream.on("finish", () => {
    terminal.log("🏁 ", `WP Core Sync complete.`);
    terminal.log("💾 ", `Saved to ${pathName}`);
  });

  writeStream.on("error", err => {
    terminal.log(
      "🐞 ",
      `There is an error writing the file ${pathName} => ${err}`
    );
  });

  writeStream.end();
});
