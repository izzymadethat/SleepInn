"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsToMany(models.Review, {
        through: "ReviewImages",
        foreignKey: "imageId",
        otherKey: "reviewId",
      });
      Image.belongsToMany(models.Spot, {
        through: "SpotImages",
        foreignKey: "imageId",
        otherKey: "spotId",
      });
      Image.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  Image.init(
    {
      url: DataTypes.STRING,
      spotId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      reviewId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Image",
    }
  );
  return Image;
};
