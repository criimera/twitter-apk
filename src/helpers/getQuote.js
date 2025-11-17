const fs = require("fs");


/**
 * Gets a random quote from comments.txt
 * @param {Function} [callback] Called with `quotes` (Array) on completion.
 */
module.exports.getQuote = (callback) => {
    logger("info", "Loading quotes from comments.txt...", false, true);

    let quotes = [];

    quotes = fs.readFileSync("./comments.txt", "utf8").split("\n"); // Get all quotes from the quotes.txt file into an array
    quotes = quotes.filter(str => str != ""); // Remove empty quotes as empty comments will not work/make no sense

    quotes.forEach((e, i) => { // Multi line strings that contain \n will get splitted to \\n -> remove second \ so that node-steamcommunity understands the quote when commenting
        if (e.length > 999) {
            logger("warn", `The quote.txt line ${i} is longer than the limit of 999 characters. This quote will be ignored for now.`, true, false);
            quotes.splice(i, 1); // Remove this item from the array
            return;
        }

        quotes[i] = e.replace(/\\n/g, "\n").replace("\\n", "\n");

        // Make callback on last iteration
        if (quotes.length <= i + 1) {
            callback(quotes);
        }
    });
};
