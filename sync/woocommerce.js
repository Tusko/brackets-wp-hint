const _ = require("lodash");
const fs = require("fs");
const writeStream = fs.createWriteStream(
  __dirname + "/../lists/woocommerce.txt"
);
const pathName = writeStream.path.replace("../", "");
const htmlToJson = require("html-to-json");
const terminal = require("../terminal");

const base2fetch = [
  "https://docs.woocommerce.com/wc-apidocs/hook-docs.html",
  "https://docs.woocommerce.com/wc-apidocs/package-None.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Abstracts.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Admin.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Admin.Customize.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Admin.Functions.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Admin.Importers.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Admin.Meta.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Admin.Reports.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Admin.System.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.API.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Data.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Emails.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Embed.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Interfaces.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Log.Handlers.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Payment.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Products.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Shipping.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Classes.Walkers.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Export.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Functions.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Import.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.l10n.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.PaymentTokens.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.PayPal.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Shortcodes.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Shortcodes.Cart.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Shortcodes.Checkout.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Shortcodes.My.Account.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Shortcodes.Order.Tracking.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Webhooks.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WooCommerce.Widgets.html",
  "https://docs.woocommerce.com/wc-apidocs/package-WP.Background.Processing.html"
];
const promises = [];

const linkParser = htmlToJson.createParser([
  "#content .table:not(#packages) a[href]:not(.deprecated)",
  {
    func: function($a) {
      return $a.text();
    }
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
  let l = fetchUrl.split("/");

  terminal.log(
    "⏱️ ",
    "Creating Promises for " + l[l.length - 1].replace(".html", "")
  );

  promises.push(pageParser(fetchUrl));
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
    terminal.log("🏁 ", `WooCommerce Sync complete.`);
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
