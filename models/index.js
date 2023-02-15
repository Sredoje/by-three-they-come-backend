//importing modules
const { Sequelize, DataTypes } = require('sequelize');
console.log('process.env.DB_HOST', process.env.DB_HOSTNAME);
let options = {
  host: process.env.DB_HOSTNAME,
  port: process.env.DB_PORT,
  dialect: 'postgres',
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  options
);

//checking if connection is done
sequelize
  .authenticate()
  .then(() => {
    console.log(`Database connected to discover`);
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//connecting to model
db.users = require('./user.js')(sequelize, DataTypes);
db.posts = require('./post.js')(sequelize);
db.postItems = require('./postItem.js')(sequelize, DataTypes);
// db.sequelize.models.associate();
//exporting the module
module.exports = db;
