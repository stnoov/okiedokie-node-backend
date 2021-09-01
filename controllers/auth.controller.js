const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  User.create({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    age: req.body.age,
    balance: 300,
    classes_completed: 0,
    okie_dokie_points: 0,
    isAdmin: false,
  })
    .then(() => {
      res.send({ message: "User was registered successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: "24h",
      });
      res.status(200).send({
        id: user.id,
        email: user.email,
        accessToken: token,
        balance: user.balance,
        classes_completed: user.classes_completed,
        isAdmin: user.isAdmin,
        okie_dokie_points: user.okie_dokie_points,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.fetch_user = (req, res) => {
  User.findOne({
    where: { id: req.userId },
  })
    .then((user) => {
      let token = req.headers["x-access-token"];
      res.status(200).send({
        id: user.id,
        email: user.email,
        accessToken: token,
        balance: user.balance,
        classes_completed: user.classes_completed,
        isAdmin: user.isAdmin,
        okie_dokie_points: user.okie_dokie_points,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
