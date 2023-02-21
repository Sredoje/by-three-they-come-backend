'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('PostItems', 'status', {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['locked', 'unlocked', 'deleted'],
        default: 'unlocked',
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([queryInterface.removeColumn('PostItems', 'status')]);
  },
};
