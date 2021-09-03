const { authJwt, checkAdminRights } = require("../middleware");
const controller = require("../controllers/news.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/news/add_news",
    [authJwt.verifyToken, checkAdminRights],
    controller.add_news
  );
  app.post(
    "/api/news/edit_news",
    [authJwt.verifyToken, checkAdminRights],
    controller.edit_news
  );
  app.post(
    "/api/news/delete_news",
    [authJwt.verifyToken, checkAdminRights],
    controller.delete_news
  );
  app.get("/api/news/get_news", controller.get_news);
};
