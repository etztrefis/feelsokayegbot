module.exports.help = {
    name: 'yourmom',
    cooldown: 5000,
    cooldown_mode: 'UserCommand',
    aliases: ['mom'],
    description: 'Posts random joke about your mom.',
    run: async (context) => {
        const fs = require('fs');
        try {
            const data = fs.readFileSync('./data/mom_jokes.json');
            const dataValues = JSON.parse(data);
            const values = Object.values(dataValues.data);
            const random = Math.floor(Math.random() * values.length);
            randomValue = values[random];
            if (context.message.args[0]) {
                if (context.message.args[0].charAt(0) === '@') {
                    return `${context.message.args[0]}, ${randomValue} forsenHead`;
                } else {
                    return `@${context.message.args[0]}, ${randomValue} forsenHead`;
                }
            } else {
                return `@${context.user.name}, ${randomValue} forsenHead`;
            }
        } catch (e) {
            console.log(e);
            return 'Error wile reading file.';
        }
    },
};
