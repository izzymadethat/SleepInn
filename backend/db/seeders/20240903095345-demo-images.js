"use strict";
const { Image } = require("../models");
const { imagesSeed } = require("../../utils/seed-data");

/** @type {import('sequelize-cli').Migration} */
const options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

options.tableName = "Images";
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
    try {
      console.log("Seeding images", imagesSeed);
      console.log("Some images are being created");
      await Image.bulkCreate(imagesSeed, { validate: true });
    } catch (err) {
      console.log("Sequelize error:", err);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Images";
    await queryInterface.bulkDelete(options, null, {});
  },
};
