const db = require("../models");
const Review = db.review;
const User = db.user;
exports.add_review = (req, res) => {
  Review.create({
    message: req.body.message,
    userId: req.userId,
  })
    .then(() => {
      Review.findAll({ include: User, order: [["updatedAt", "DESC"]] }).then(
        (data) => {
          res.send({ reviews: data });
        }
      );
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.show_reviews = (req, res) => {
  Review.findAll({ include: User, order: [["updatedAt", "DESC"]] })
    .then((data) => {
      res.send({ reviews: data });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
