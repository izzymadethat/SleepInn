"use strict";

const { Spot } = require("../models");
const { spotSeed } = require("../../utils/seed-data");

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
    await Spot.bulkCreate(spotSeed, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    const addresses = spotSeed.map((spot) => spot.address);
    return await queryInterface.bulkDelete(
      "Spots",
      {
        address: {
          [Op.in]: addresses,
        },
      },
      {}
    );
  },
};
