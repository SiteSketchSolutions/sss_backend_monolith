const fs = require("fs");
const path = require("path");
const { DATABASE } = require("../../config");
const basename = path.basename(__filename);

const { Sequelize } = require("sequelize");
const associations = require("../../config/associations");

const sequelize = new Sequelize(
  DATABASE.database,
  DATABASE.username,
  DATABASE.password,
  {
    host: DATABASE.host,
    dialect: DATABASE.dialect,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
const db = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });

db.Sequelize = Sequelize;
db.sequelize = sequelize;

associations(db);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// sync
// db.sequelize.sync();

//Uncomment if a new column has been added, otherwise it alters the columns regardless of a new addition
db.sequelize.sync({ alter: true });

// Force the creation
// ModelName.sync({ force: true }); // this will drop the table first and re-create it afterwards
// db.sequelize.sync({ force: false });

module.exports = db;
