const sessionHandler = require("../sessionHandler.js");


sessionHandler.prototype._attachEvents = function() {

    this.session.on("authenticated", () => { // Success
        logger.stopReadInput("Login request accepted"); // Should the user have approved this login attempt via the mobile Steam Guard app, stop readInput() from handle2FA

        logger("debug", `[${this.thisbot}] getRefreshToken(): Login request successful, '${this.session.accountName}' authenticated. Resolving Promise...`);

        this._resolvePromise(this.session.refreshToken);
    });


    this.session.on("timeout", () => { // Login attempt took too long, failure

        // TODO: Retry?

        logger("warn", `[${this.thisbot}] Login attempt timed out!`);

        this._resolvePromise(null);
    });


    this.session.on("error", (err) => { // Failure
        logger("error", `[${this.thisbot}] Failed to get a session for account '${this.logOnOptions.accountName}'! Error: ${err.stack ? err.stack : err}`); // Session.accountName is only defined on success

        // TODO: When does this event fire? Do I need to do something else?
        // TODO: Retry until advancedconfig.maxLogOnRetries?

        this._resolvePromise(null);
    });

};
