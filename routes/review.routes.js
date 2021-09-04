const { authJwt, checkAdminRights } = require("../middleware");
const controller = require("../controllers/review.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/reviews/add_review",
    [authJwt.verifyToken],
    controller.add_review
  );

  app.get("/api/reviews/get_reviews", controller.show_reviews);

  app.post(
    "/api/reviews/delete_review",
    [checkAdminRights],
    controller.delete_review
  );
};
