// const mysql = require('mysql2');
const Sequelize = require("sequelize");
const { DATABASE } = require("../../config/index");

const databaseUrl = process.env.DATABASE_URL;
//DB configuration
const sequelize = new Sequelize(
  DATABASE.database,
  DATABASE.username,
  DATABASE.password,
  {
    host: DATABASE.host,
    dialect: DATABASE.dialect,
    logging: false,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false, // You may need to set this depending on your SSL certificate setup
    //   },
    // },
    // ssl: true,
  }
);

// const sequelize = new Sequelize(databaseUrl, {
//   dialect: DATABASE.dialect,
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false, // Adjust this based on your SSL certificate setup
//     },
//   },
//   ssl: true, // This option may not be necessary, but included for completeness
// });

// database connection
async function dbConnection() {
  console.log("CONNECTING TO DB POSTGRES");
  try {
    await sequelize.authenticate();
    console.log(
      "######## Database Connection has been established successfully ######"
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

dbConnection();

module.exports = sequelize;
