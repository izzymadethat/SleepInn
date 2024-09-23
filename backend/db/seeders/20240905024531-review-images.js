"use strict";
const { ReviewImage } = require("../models");
const { reviewImageSeed } = require("../../utils/seed-data");

const options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Seeding ReviewImages...");
    await ReviewImage.bulkCreate(reviewImageSeed, { validate: true });
    console.log("Finished Seeding ReviewImages");
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "ReviewImages";
    await queryInterface.bulkDelete(options, null, {});
  },
};
