'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SpotImage.init({
    spotId: {
      type: Sequelize.INTEGER,
      allowNull:false,
      references: {
        model: "Spots",
        key: "id",
      },
      onDelete:"CASCADE"
    },
    imageId: {
      type: Sequelize.INTEGER,
      allowNull:false,
      references: {
        model: "Images",
        key: "id",
      }
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull:false,
      references: {
        model: "Users",
        key: "id",
      }
    },
  }, {
    sequelize,
    modelName: 'SpotImage',
  });
  return SpotImage;
};
