"use strict";

const { Review } = require("../models");
const { reviewSeed } = require("../../utils/seed-data");

const options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Seeding Reviews...");
    await Review.bulkCreate(reviewSeed, { validate: true });
    console.log("Finished Seeding Reviews");
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Reviews";
    const Op = Sequelize.Op;
    const spotIds = reviewSeed.map((review) => review.spotId);
    await queryInterface.bulkDelete(options, {
      spotId: {
        [Op.in]: spotIds,
      },
    });
  },
};
