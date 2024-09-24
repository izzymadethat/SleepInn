"use strict";
const { Booking } = require("../models");
const { bookingSeed } = require("../../utils/seed-data");

const options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Seeding Bookings...");
    try {
      await Booking.bulkCreate(bookingSeed, { validate: true });
    } catch (error) {
      console.log(error);
    }
    console.log("Finished Seeding Bookings");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Bookings";
    const Op = Sequelize.Op;
    const spotIds = bookingSeed.map((booking) => booking.spotId);
    await queryInterface.bulkDelete(options, {
      spotId: {
        [Op.in]: spotIds,
      },
    });
  },
};
