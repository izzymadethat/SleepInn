"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsToMany(models.Review, {
        through: "ReviewImages",
        foreignKey: "imageId",
        otherKey: "reviewId",
      });

      Image.belongsTo(models.Spot, {
        foreignKey: "spotId",
        allowNull: true,
        onDelete: "CASCADE",
      });

      Image.belongsTo(models.User, {
        foreignKey: "ownerId",
      });

      // If `reviewId` is not used in the join table, ensure its association here
      Image.belongsTo(models.Review, {
        foreignKey: "reviewId",
        allowNull: true,
        onDelete: "CASCADE",
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
      },
    }
  );

  return Image;
};
