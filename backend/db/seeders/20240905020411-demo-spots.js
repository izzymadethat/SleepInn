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
    console.log("Seeding Spots...");
    await Spot.bulkCreate(spotSeed, { validate: true });
    console.log("Finished Seeding Spots");
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    const addresses = spotSeed.map((spot) => spot.address);
    await queryInterface.bulkDelete(options, {
      name: {
        [Op.in]: addresses,
      },
    });
  },
};
