const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const writeStream = fs.createWriteStream(__dirname + "/../lists/acf.txt");
const htmlToJson = require("html-to-json");
const pathName = writeStream.path.replace("../", "");
const terminal = require("../terminal");

const funcParser = htmlToJson.createParser([
  ".section#functions table tbody tr",
  {
    func: $el =>
      $el
        .find(".td-name a[href]")
        .text()
        .trim(),
    method: $el =>
      $el
        .next()
        .find(".td-description")
        .text()
  }
]);

terminal.log("🖨️ ", "Started to load ACF functions");
terminal.spinner.start();

const timerStart = Date.now();

funcParser
  .request("https://www.advancedcustomfields.com/resources/")
  .then(links => {
    for (f in links) {
      writeStream.write(links[f].func + "\n");
    }

    terminal.spinner.stop();
    terminal.log(
      "🧨 ",
      "Loaded in " + (Date.now() - timerStart) / 1000 + " seconds"
    );

    writeStream.on("finish", () => {
      terminal.log("🏁 ", `ACF Sync complete.`);
      terminal.log("💾 ", `Saved to ${pathName}`);
    });

    writeStream.on("error", err => {
      terminal.log(
        "🐞 ",
        `There is an error writing the file ${pathName} => ${err}`
      );
    });

    writeStream.end();
  })
  .catch(e => {
    throw new Error(e);
  });
