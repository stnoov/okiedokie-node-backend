module.exports = (sequelize, Sequelize) => {
  const Lesson = sequelize.define("lessons", {
    title: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.STRING,
    },
    num_students: {
      type: Sequelize.STRING,
    },
    group: {
      type: Sequelize.STRING,
    },
    teacher: {
      type: Sequelize.STRING,
    },
    time: {
      type: Sequelize.STRING,
    },
    price: {
      type: Sequelize.STRING,
    },
    link: {
      type: Sequelize.STRING,
    },
    datetime: {
      type: Sequelize.STRING,
    },
    docs: {
      type: Sequelize.STRING,
    },
  });

  return Lesson;
};
