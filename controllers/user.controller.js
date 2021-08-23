const db = require("../models");
const User = db.user;

exports.get_user_data = (req, res) => {
  User.findOne({
    where: {
      id: req.userId,
    },
  }).then((user) => {
    if (user !== null) {
      res.send({ userData: user });
    } else {
      res.status(404).send({ message: "not found" });
    }
  });
};

exports.get_all_users = (req, res) => {
  User.findAll({
    attributes: [
      "name",
      "email",
      "age",
      "balance",
      "okie_dokie_points",
      "classes_completed",
    ],
  })
    .then((data) => {
      res.send({ users: data });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.edit_user = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      user
        .update({
          okie_dokie_points: req.body.okie_dokie_points,
          balance: req.body.balance,
        })
        .then(() => {
          res.send({ message: "User was updated" });
        });
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
    }
  });
};

exports.delete_user = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      user.destroy().then(() => {
        res.send({ message: "User was deleted" });
      });
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
    }
  });
};
