const { EResult } = require("steam-session");
const sessionHandler = require("../sessionHandler.js");


/**
 * Helper function to make handling login errors easier
 * @param {*} err Error thrown by startWithCredentials()
 */
sessionHandler.prototype._handleCredentialsLoginError = function(err) {

    // Log error message
    logger("", "", true);
    logger("error", `[${this.thisbot}] Couldn't log in! '${err}' (${err.eresult})`, true);
    logger("debug", err.stack, true);

    // Add additional messages for specific errors to hopefully help the user diagnose the cause
    if (err.eresult == EResult.InvalidPassword) logger("", `Note: The error "InvalidPassword" (${err.eresult}) can also be caused by a wrong Username or shared_secret!\n      Try omitting the shared_secret (if you provided one) and check the username & password of '${this.logOnOptions.accountName}' in account.txt!`, true);

    // Skips account
    this._resolvePromise(null);

};


/**
 * Helper function to make handling login errors easier
 * @param {*} err Error thrown by startWithQR()
 */
sessionHandler.prototype._handleQrCodeLoginError = function(err) {

    logger("error", `[${this.thisbot}] Failed to start a QR-Code session! Are you having connectivity issues to Steam? ${err}`);
    logger("debug", err.stack, true);

    this._resolvePromise(null); // Skips account

};
