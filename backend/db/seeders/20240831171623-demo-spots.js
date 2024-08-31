'use strict';

const { Spot } = require("../models")
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId:1,
        address: "123 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 37.7645358,
        lng: -122.4730327,
        name: "App Academy",
        description: "Place where web developers are created",
        price: 123
      },{
        ownerId:1,
        address: "129 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 43.7645358,
        lng: -132.4730327,
        name: "App Academy admission office",
        description: "Place where web developers are accepted",
        price: 129
      },{
        ownerId:1,
        address: "135 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 50.7645358,
        lng: -145.4730327,
        name: "App Academy",
        description: "help office",
        price: 145
      }
    ],{validate:true}
  );
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        address: { [Op.in]: ["123 Disney Lane", "129 Disney Lane", "135 Disney Lane"] },
      },
      {}
    );
  },
};
