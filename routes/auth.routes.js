const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateEmail],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.get("/api/user/fetch_user", [authJwt.verifyToken], controller.fetch_user);

  app.post("/api/user/reset_password", controller.reset_password);

  app.post("/api/user/update_password", controller.update_password);
};
