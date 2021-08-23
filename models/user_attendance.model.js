module.exports = (sequelize, Sequelize) => {
  const UserAttendance = sequelize.define("user_attendance", {});

  return UserAttendance;
};
