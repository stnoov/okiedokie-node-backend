const { authJwt } = require("../middleware");
const controller = require("../controllers/lesson.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/lessons/add_lesson",
    [authJwt.verifyToken],
    controller.add_lesson
  );
  app.post(
    "/api/lessons/edit_lesson",
    [authJwt.verifyToken],
    controller.edit_lesson
  );
  app.post(
    "/api/lessons/delete_lesson",
    [authJwt.verifyToken],
    controller.delete_lesson
  );
  app.post(
    "/api/lessons/sign_up_for_a_lesson",
    [authJwt.verifyToken],
    controller.sign_up_for_a_lesson
  );

  app.get("/api/lessons/get_lessons", controller.get_lessons);

  app.get(
    "/api/lessons/get_user_classes",
    [authJwt.verifyToken],
    controller.get_user_classes
  );
};
