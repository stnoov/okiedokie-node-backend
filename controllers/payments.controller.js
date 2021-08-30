require("dotenv").config();
var sha1 = require("sha1");

exports.handle_payments = (req, res) => {
  const checkNotification = `${req.body.notification_type}&${req.body.operation_id}&${req.body.amount}&${req.body.currency}&${req.body.datetime}&${req.body.sender}&${req.body.codepro}&${process.env.NOTIFICATION_SECRET}&${req.body.label}`;
  const sha1_hash = sha1(checkNotification);
  console.log("sha1_hash: ", sha1_hash);
  if (req.body.sha1_hash === sha1_hash) {
    return "SUCCESS";
  }
};
