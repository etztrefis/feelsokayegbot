"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ban = exports.UserBanError = void 0;
const await_response_1 = require("../await/await-response");
const conditions_1 = require("../await/conditions");
const errors_1 = require("../client/errors");
const channel_1 = require("../validation/channel");
const privmsg_1 = require("./privmsg");
class UserBanError extends errors_1.MessageError {
    constructor(channelName, username, reason, message, cause) {
        super(message, cause);
        this.channelName = channelName;
        this.username = username;
        this.reason = reason;
    }
}
exports.UserBanError = UserBanError;
const failureNoticeIDs = [
    "no_permission",
    "bad_ban_admin",
    "bad_ban_anon",
    "bad_ban_broadcaster",
    "bad_ban_global_mod",
    "bad_ban_mod",
    "bad_ban_self",
    "bad_ban_staff",
    "usage_ban",
];
const successNoticeIDs = ["ban_success", "already_banned"];
async function ban(conn, channelName, username, reason) {
    channel_1.validateChannelName(channelName);
    channel_1.validateChannelName(username);
    let cmd;
    if (reason != null) {
        cmd = `/ban ${username} ${reason}`;
    }
    else {
        cmd = `/ban ${username}`;
    }
    await privmsg_1.sendPrivmsg(conn, channelName, cmd);
    await await_response_1.awaitResponse(conn, {
        success: conditions_1.matchingNotice(channelName, successNoticeIDs),
        failure: conditions_1.matchingNotice(channelName, failureNoticeIDs),
        errorType: (msg, cause) => new UserBanError(channelName, username, reason, msg, cause),
        errorMessage: `Failed to ban ${username} in #${channelName}`,
    });
}
exports.ban = ban;
//# sourceMappingURL=ban.js.map