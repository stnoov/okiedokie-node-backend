const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: 0,

  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.review = require("../models/review.model.js")(sequelize, Sequelize);
db.news = require("../models/news.model.js")(sequelize, Sequelize);
db.lesson = require("../models/lesson.model.js")(sequelize, Sequelize);
db.payments = require("../models/payments.model.js")(sequelize, Sequelize);
db.user_attendance = require("../models/user_attendance.model.js")(
  sequelize,
  Sequelize
);

db.user.hasMany(db.review, {
  foreignKey: "userId",
});
db.review.belongsTo(db.user);

db.user.hasMany(db.payments, {
  foreignKey: "userId",
});
db.payments.belongsTo(db.user);

db.user.belongsToMany(db.lesson, {
  as: "lessons",
  through: db.user_attendance,
  foreignKey: "user_id",
  otherKey: "lesson_id",
});

db.lesson.belongsToMany(db.user, {
  as: "user",
  through: db.user_attendance,
  foreignKey: "lesson_id",
  otherKey: "user_id",
});

module.exports = db;
