module.exports = (sequelize, Sequelize) => {
  const Review = sequelize.define("reviews", {
    message: {
      type: Sequelize.STRING,
    },
  });

  return Review;
};
