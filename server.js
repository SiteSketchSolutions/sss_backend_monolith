"use strict";

/***********************************
 **** node module defined here *****
 ***********************************/
require("dotenv").config();
const EXPRESS = require("express");
const CONFIG = require("./config");
const path = require("path");
/**creating express server app for server */
const app = EXPRESS();

if (process.env.MAINTENANCE_MODE === "true") {
  app.use((req, res, next) => {
    return res.status(503).json({
      statusCode: 503,
      msg: "The system is currently under maintenance. Please try again later.",
      status: false,
      type: "SERVER_ERROR"
    });
  })
}
/********************************
 ***** Server Configuration *****
 ********************************/
app.set("port", CONFIG.server.PORT);
// app.use(EXPRESS.static(__dirname + '/'));
const server = require("http").Server(app);

// Add this line after creating the Express app
const uploadsPath = path.join(__dirname, "uploads");
console.log("Serving uploads from:", uploadsPath);
app.use("/uploads", EXPRESS.static(uploadsPath));

/** Server is running here */
let startNodeserver = async () => {
  // express startup.
  await require("./app/startup/expressStartup")(app);

  return new Promise((resolve, reject) => {
    server.listen(CONFIG.server.PORT, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

startNodeserver()
  .then(() => {
    console.log("Node server running on ", CONFIG.server.URL);
  })
  .catch((err) => {
    console.log("Error in starting server", err);
    process.exit(1);
  });

process.on("unhandledRejection", (error) => {
  // Will print "unhandledRejection err is not defined"
  console.log("unhandledRejection", error);
});
