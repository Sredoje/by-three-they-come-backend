'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PostItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      originalName: {
        type: Sequelize.STRING,
      },
      mimeType: {
        type: Sequelize.STRING,
      },
      key: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      postId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'Posts',
          },
          key: 'id',
        },
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PostItems');
  },
};
