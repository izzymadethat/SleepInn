"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.Review, {
        foreignKey: "reviewId",
      });

      Image.belongsTo(models.Spot, {
        foreignKey: "spotId",
        allowNull: true,
        onDelete: "CASCADE",
      });

      Image.belongsTo(models.User, {
        foreignKey: "ownerId",
        allowNull: true, // Allow null if not every image has an owner
      });
    }
  }

  Image.init(
    {
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Spots",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      reviewId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Reviews",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Image",
      validate: {
        eitherSpotOrReview() {
          if (!this.spotId && !this.reviewId) {
            throw new Error(
              "An image must be associated with either a spot or a review."
            );
          }
        },

        handleSpotAndReview() {
          if (this.spotId && this.reviewId) {
            throw new Error(
              "An image cannot be associated with both a spot and a review."
            );
          }
        },
      },
    }
  );

  return Image;
};
