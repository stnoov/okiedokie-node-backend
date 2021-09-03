const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { user } = require("../models");
const db = require("../models");
const User = db.user;

const checkAdminRights = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    User.findOne({ where: { id: decoded.id } })
      .then(() => {
        if (!user.isAdmin) {
          res.status(403).send({
            message: "Not an admin",
          });
        }
        console.log("User is admin");
      })
      .catch((error) => {
        console.log(error);
      });
    next();
  });
};

module.exports = checkAdminRights;
