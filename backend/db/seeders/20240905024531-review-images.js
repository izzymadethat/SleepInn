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
    await ReviewImage.bulkCreate(reviewImageSeed, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "ReviewImages";
    await queryInterface.bulkDelete(options, null, {});
  }
};
