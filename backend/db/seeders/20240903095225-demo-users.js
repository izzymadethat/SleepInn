"use strict";
const { User } = require("../models");
const { userSeed } = require("../../utils/seed-data");

/** @type {import('sequelize-cli').Migration} */

const options = {};

if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await User.bulkCreate(userSeed, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Users";
    const Op = Sequelize.Op;
    const usernames = userSeed.map((user) => user.username);
    await queryInterface.bulkDelete(
      "Users",
      {
        username: { [Op.in]: usernames },
      },
      {}
    );
  },
};
