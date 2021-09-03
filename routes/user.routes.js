const { authJwt, checkAdminRights } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/users/get_user_data",
    [authJwt.verifyToken],
    controller.get_user_data
  );

  app.get(
    "/api/users/check_user",
    [authJwt.verifyToken],
    controller.get_user_data
  );

  app.post(
    "/api/users/edit_user",
    [authJwt.verifyToken, checkAdminRights],
    controller.edit_user
  );
  app.post(
    "/api/users/delete_user",
    [authJwt.verifyToken, checkAdminRights],
    controller.delete_user
  );
  app.get("/api/users/get_all_users", controller.get_all_users);
};
