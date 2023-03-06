'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('Users', 'role', {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ['admin', 'normal', 'manager'],
        default: 'normal',
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([queryInterface.removeColumn('Users', 'role')]);
  },
};
