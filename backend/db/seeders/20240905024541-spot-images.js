"use strict";
const { SpotImage } = require("../models");
const { spotImageSeed } = require("../../utils/seed-data");

const options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Seeding SpotImages...");
    await SpotImage.bulkCreate(spotImageSeed, { validate: true });
    console.log("Finished Seeding SpotImages");
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages";
    await queryInterface.bulkDelete(options, null, {});
  },
};
