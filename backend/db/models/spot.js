"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spot.belongsTo(models.User, {
        foreignKey: "ownerId",
        as:"Owner"
      });
      Spot.belongsToMany(models.Image,{
        through:"SpotImages",
        foreignKey:"spotId",
        otherKey:"imageId",
        });
    }
  }
  Spot.init(
    {
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lat: DataTypes.FLOAT,
      lng: DataTypes.FLOAT,
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.STRING,
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      averageRating: DataTypes.FLOAT,
      previewImg: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Spot",
    }
  );
  return Spot;
};
