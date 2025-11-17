const SteamCommunity = require("steamcommunity"); //eslint-disable-line
const { EIdTypes } = require("./loadDestinations.js");

const randomstring = (arr) => arr[Math.floor(Math.random() * arr.length)];


/**
 * Comments on a destination
 * @param {{ raw: string, processed: string, type: EIdTypes }} dest The destination to comment on
 * @param {Array} quotes Array of quotes
 * @param {SteamCommunity} community The SteamCommunity instance
 * @param {function(any | null): void} callback Called on completion with `null` on success or the error returned by SteamCommunity
 */
module.exports.comment = async function(dest, quotes, community, callback) {

    // Determine the function to use for this type
    /**
     * @type {Function}
     */
    let postComment;
    let commentArgs = {};

    switch (dest.type) {
        case "profile":
            postComment = community.postUserComment; // Context of the correct bot account is applied later
            commentArgs = { receiverSteamID64: dest.processed, quote: null };
            break;
        case "group":
            postComment = community.postGroupComment; // Context of the correct bot account is applied later
            commentArgs = { receiverSteamID64: dest.processed, quote: null };
            break;
        case "sharedfile":
            postComment = community.postSharedFileComment; // Context of the correct bot account is applied later
            commentArgs = { sharedfileOwnerId: null, sharedfileId: dest.processed, quote: null };

            // Get sharedfileOwnerId by scraping sharedfile DOM - Quick hack to await function that only supports callbacks
            await (() => {
                return new Promise((resolve) => {
                    community.getSteamSharedFile(dest.processed, (err, obj) => {
                        if (err) {
                            logger("error", "Couldn't get sharedfile even though it exists?! Aborting!\n" + err);
                            return;
                        }

                        commentArgs.sharedfileOwnerId = obj.owner.getSteamID64();
                        resolve();
                    });
                });
            })();
            break;
        case "discussion":
            postComment = community.postDiscussionComment;
            commentArgs = { topicOwner: null, gidforum: null, discussionId: null, quote: null };

            // Get topicOwner & gidforum by scraping discussion DOM - Quick hack to await function that only supports callbacks
            await (() => {
                return new Promise((resolve) => {
                    community.getSteamDiscussion(dest.processed, (err, obj) => { // ReceiverSteamID64 is a URL in this case
                        if (err) {
                            logger("error", "Couldn't get discussion even though it exists?! Aborting!\n" + err);
                            return;
                        }

                        commentArgs.topicOwner = obj.topicOwner;
                        commentArgs.gidforum = obj.gidforum;
                        commentArgs.discussionId = obj.id;
                        resolve();
                    });
                });
            })();
            break;
        case "review":
            idArr = dest.processed.split("/");

            postComment =  community.postReviewComment;
            commentArgs = { receiverSteamID64: idArr[0], appID: idArr[1], quote: null };
            break;
        default:
            logger("error", `Unsupported destination type '${dest.type}' for entry '${dest.raw}'! Skipping...`);
            return;
    }

    // DEBUG: Uncomment to disable commenting
    // postComment = (a, callback) => callback(null);
    // commentArgs = { quote: null };

    // Get random quote
    commentArgs.quote = randomstring(quotes);

    logger("info", `Commenting on '${dest.type}' '${dest.processed}': ${commentArgs.quote.split("\n")[0]}`, false, false, logger.animation("loading")); // Splitting \n to only get first line of multi line comments

    // Call the function. Use call() and pass community to keep context (this.) which is lost during our postComment variable assignment
    postComment.call(community, ...Object.values(commentArgs), (err) => {
        if (err) {
            logger("warn", `Failed to comment on '${dest.type}' '${dest.processed}'! ${err}`);
        }

        callback(err);
    });
};
