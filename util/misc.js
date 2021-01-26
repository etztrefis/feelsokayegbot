const humanize = require('humanize-duration');
const shortHumanize = humanize.humanizer({
    language: 'shortEn',
    languages: {
        shortEn: {
            y: () => 'y',
            mo: () => 'mo',
            w: () => 'w',
            d: () => 'd',
            h: () => 'h',
            m: () => 'm',
            s: () => 's',
            ms: () => 'ms',
        },
    },
});

module.exports.uptime = () => {
    const ms = process.uptime() * 1000;
    return shortHumanize(ms, {
        units: ['w', 'd', 'h', 'm', 's'],
        largest: 4,
        round: true,
        conjunction: '',
        spacer: '',
    });
};

module.exports.secondConvert = (seconds) => {
    const ms = seconds * 1000;
    return shortHumanize(ms, {
        units: ['h', 'm', 's', 'ms'],
        round: true,
        conjunction: ' and ',
        spacer: '',
    });
};

module.exports.humanizeTimeStamp = (stamp, options) => {
    const ms = new Date().getTime() - Date.parse(stamp);
    options = options || {
        units: ['y', 'd', 'h', 'm', 's'],
        largest: 3,
        round: true,
        conjunction: ' and ',
        spacer: '',
    };
    return shortHumanize(ms, options);
};

module.exports.supiactive = async () => {
    const {data} = await fob.Utils.got.supinic
        .put('bot-program/bot/active')
        .json();
    if (data.success) {
        return 'Success';
    }
};

module.exports.randomArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

module.exports.logError = async (name, reason, stack) => {
    await fob.Utils.db.query(`INSERT INTO Logs(Name, Message, Stack) VALUES ("${name}", "${reason}", "${stack}")`);
};
