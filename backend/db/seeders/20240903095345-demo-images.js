"use strict";
const { ReviewImage, SpotImage } = require("../models");
const { spotImageSeed,reviewImageSeed } = require("../../utils/seed-data");

/** @type {import('sequelize-cli').Migration} */
const options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}


module.exports = {
  async up(queryInterface, Sequelize) {

await ReviewImage.bulkCreate(spotImageSeed, {validate:true})
await SpotImage.bulkCreate(reviewImageSeed, {validate:true})
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "SpotImages";
    await queryInterface.bulkDelete(options, null, {});
    options.tableName = "ReviewImages";
    await queryInterface.bulkDelete(options, null, {});
  },
};
