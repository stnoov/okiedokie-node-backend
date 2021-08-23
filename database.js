const { createPool } = require("mysql");

const pool = createPool({
  host: "eu-cdbr-west-01.cleardb.com",
  user: "b9f8fb84c679d0",
  password: "aedb9b04",
  database: "heroku_31b64897d9502b7",
});

module.exports = pool;
