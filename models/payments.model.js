module.exports = (sequelize, Sequelize) => {
  const Payment = sequelize.define("payments", {
    withdraw_amount: {
      type: Sequelize.STRING,
    },
    datetime: {
      type: Sequelize.STRING,
    },
    codepro: {
      type: Sequelize.STRING,
    },
    accepted: {
      type: Sequelize.STRING,
    },
  });

  return Payment;
};
