const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const checkAdminRights = require("./checkAdminRights");

module.exports = {
  authJwt,
  verifySignUp,
  checkAdminRights,
};
