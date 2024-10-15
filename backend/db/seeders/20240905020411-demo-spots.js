"use strict";
const { Spot } = require("../models");
const { spotSeed } = require("../../utils/seed-data");

const options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Spot.bulkCreate(spotSeed, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    const addresses = spotSeed.map((spot) => spot.address);
    await queryInterface.bulkDelete(options, {
      name: {
        [Op.in]: addresses
      }
    });
  }
};
