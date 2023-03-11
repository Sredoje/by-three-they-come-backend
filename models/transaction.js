'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static STATUS_SUCCESS = 'success';
    static STATUS_ERROR = 'error';
  }
  Transaction.init(
    {
      userId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM,
        values: [Transaction.STATUS_SUCCESS, Transaction.STATUS_ERROR],
      },
      content: DataTypes.TEXT,
      chargeId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Transaction',
    }
  );
  return Transaction;
};
