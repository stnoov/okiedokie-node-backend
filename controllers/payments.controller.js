require("dotenv").config();
const db = require("../models");
const sha1 = require("sha1");
const User = db.user;
const Payments = db.payments;

exports.handle_payments = (req, res) => {
  const checkNotification = `${req.body.notification_type}&${req.body.operation_id}&${req.body.amount}&${req.body.currency}&${req.body.datetime}&${req.body.sender}&${req.body.codepro}&${process.env.NOTIFICATION_SECRET}&${req.body.label}`;
  const sha1_hash = sha1(checkNotification);
  console.log("sha1_hash: ", sha1_hash);
  if (req.body.sha1_hash === sha1_hash) {
    console.log("sha1 OK");
    User.findOne({
      where: {
        id: req.body.label,
      },
    }).then((user) => {
      user
        .update({
          balance: req.body.withdraw_amount,
        })
        .then(() => {
          Payments.create({
            withdraw_amount: req.body.withdraw_amount,
            datetime: req.body.datetime,
            codepro: req.body.codepro,
            accepted: req.body.unaccepted,
            userId: req.body.label,
          });
        });
    });
  }
};
