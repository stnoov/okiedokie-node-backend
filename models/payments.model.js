module.exports = (sequelize, Sequelize) => {
  const Payment = sequelize.define("payments", {
    // Existing YooMoney fields (keep for backward compatibility)
    withdraw_amount: {
      type: Sequelize.STRING,
      allowNull: true
    },
    datetime: {
      type: Sequelize.STRING,
      allowNull: true
    },
    codepro: {
      type: Sequelize.STRING,
      allowNull: true
    },
    accepted: {
      type: Sequelize.STRING,
      allowNull: true
    },

    // New YooKassa fields
    payment_id: {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'YooKassa payment ID'
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Payment amount for YooKassa'
    },
    currency: {
      type: Sequelize.STRING(10),
      defaultValue: 'RUB',
      allowNull: false,
      comment: 'Payment currency'
    },
    status: {
      type: Sequelize.STRING(50),
      defaultValue: 'pending',
      allowNull: false,
      comment: 'Payment status'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Payment description'
    },
    yookassa_data: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Full YooKassa response data (JSON)'
    },
    completed_at: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When payment was completed'
    }
  }, {
    // Table options
    tableName: 'payments',
    timestamps: true,
    indexes: [
      {
        fields: ['payment_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['userId']
      }
    ]
  });

  return Payment;
};
