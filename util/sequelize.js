const {Sequelize} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    fob.Config.dbname,
    fob.Config.dbusername,
    fob.Config.dbpassword,
    {
        host: fob.Config.dbhost,
        dialect: 'mysql',
        logging: false,
    },
);

module.exports = sequelize;
