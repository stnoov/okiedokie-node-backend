module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    name: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    age: {
      type: Sequelize.STRING,
    },
    balance: {
      type: Sequelize.STRING,
    },
    okie_dokie_points: {
      type: Sequelize.STRING,
    },
    classes_completed: {
      type: Sequelize.STRING,
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
    },
  });

  return User;
};
