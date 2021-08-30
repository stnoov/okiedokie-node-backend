require("dotenv").config();

exports.handle_payments = (req, res) => {
  const checkNotification = `${req.body.notification_type}&${req.body.operation_id}&${req.body.req.body.amount}&${req.body.req.body.currency}&${req.body.req.body.datetime}&${req.body.sender}&${req.body.codepro}&${process.env.NOTIFICATION_SECRET}&${req.body.label}&`;
  console.log("---------------------------");
  console.log("checkNotification: ", checkNotification);
  console.log("---------------------------");
};
