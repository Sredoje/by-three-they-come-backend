//importing modules
const { Sequelize, DataTypes } = require("sequelize");
console.log("process.env.DB_HOST");
let options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  logging: console.log,
};

// Local db
// const sequelize = new Sequelize(
//   `postgres://postgres:admin@localhost:5432/by-three-they-come`,
//   {dialect: "postgres"}
// );]

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
db.users = require("./userModel.js")(sequelize, DataTypes);

//exporting the module
module.exports = db;
