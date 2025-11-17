const https = require("https");


/**
 * Checks if an update is available from the GitHub repository and logs a message
 */
module.exports.checkForUpdate = function() {
    logger("info", "Checking for an available update...", false, true, logger.animation("loading"));

    let output = "";

    try {
        const localVersion = require("../../package.json").version;

        const req = https.get("https://raw.githubusercontent.com/3urobeat/steam-mass-comment-bot/master/package.json", function(res) {
            res.setEncoding("utf8");

            res.on("data", (chunk) => {
                output += chunk;
            });

            res.on("end", () => {
                output = JSON.parse(output);
                const onlineVersion = output.version;

                if (onlineVersion && onlineVersion != localVersion) {
                    logger("", "", true);
                    logger("", `${logger.colors.fggreen}Update available!${logger.colors.reset} Your version: ${logger.colors.fgred}${localVersion}${logger.colors.reset} | New version: ${logger.colors.fggreen}${onlineVersion}`, true);
                    logger("", "", true);
                    logger("", `Download it here and transfer your accounts.txt, config.json & proxies.txt:\n${logger.colors.fgcyan}${logger.colors.underscore}https://github.com/3urobeat/steam-mass-comment-bot/archive/refs/heads/master.zip`, true);
                    logger("", "", true);
                }
            });
        });

        req.on("error", function(err) {
            logger("warn", `${logger.colors.reset}[${logger.colors.fgred}Notice${logger.colors.reset}]: Couldn't check for an available update because either GitHub is down or your internet isn't working.\n          Error: ${err}`, true);
        });
    } catch (err) {
        logger("error", "Failed to check for an update: " + err, true);
    }
};
