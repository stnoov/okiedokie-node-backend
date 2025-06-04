const { authJwt } = require("../middleware");
const controller = require("../controllers/payments.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Legacy YooMoney webhook
  app.post("/payment/notifications", controller.handle_payments);

  // New YooKassa endpoints
  app.post("/api/payments/create", [authJwt.verifyToken], controller.create_payment);
  app.post("/api/payments/webhook", controller.handle_yookassa_webhook);
  app.get("/api/payments/:paymentId/status", [authJwt.verifyToken], controller.get_payment_status);
  app.get("/api/payments/history", [authJwt.verifyToken], controller.get_payment_history);
};
