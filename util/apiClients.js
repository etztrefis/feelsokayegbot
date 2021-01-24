const got = require('got');

// Generic GET requests
module.exports.generic = got.extend({
    timeout: 1500,
});

module.exports.twitchAuth = got.extend({
    prefixUrl: 'https://id.twitch.tv',
    responseType: 'json',
});

// Twitch API v5
module.exports.kraken = got.extend({
    prefixUrl: 'https://api.twitch.tv/kraken',
    timeout: 1500,
    responseType: 'json',
    headers: {
        'Client-ID': fob.Config.clientid,
        'Accept': 'application/vnd.twitchtv.v5+json',
    },
});

// Twitch Helix API
module.exports.helix = async () => {
    return got.extend({
        prefixUrl: 'https://api.twitch.tv/helix',
        timeout: 1500,
        responseType: 'json',
        headers: {
            'Client-ID': fob.Config.clientid,
            'Authorization': `Bearer ${fob.Config.bearer_token}`,
        },
    });
};

// Twitch TMI API
module.exports.tmi = got.extend({
    prefixUrl: 'https://tmi.twitch.tv',
    timeout: 3500,
    responseType: 'json',
});

// GitHub API
module.exports.gh = got.extend({
    prefixUrl: 'https://api.github.com/',
    timeout: 3500,
    responseType: 'json',
});

// Logs API
module.exports.logs = got.extend({
    prefixUrl: 'https://logs.ivr.fi',
    timeout: 2500,
    responseType: 'json',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Supinic API
module.exports.supinic = got.extend({
    timeout: 10000,
    responseType: 'json',
    prefixUrl: 'https://supinic.com/api',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'feelsokayegbot / trefis@twitch',
        'Authorization': `Basic ${fob.Config.supiapi}`,
    },
});

// reddit API
module.exports.reddit = got.extend({
    prefixUrl: 'https://www.reddit.com/r',
    responseType: 'json',
    throwHttpErrors: false,
    headers: {
        Cookie: '_options={%22pref_quarantine_optin%22:true};',
    },
});
