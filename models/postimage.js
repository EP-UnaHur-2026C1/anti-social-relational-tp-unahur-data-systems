'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostImage extends Model {
    static associate(models) {
      PostImage.belongsTo(models.Post, { foreignKey: 'postId', onDelete: 'CASCADE' });
    }
  }
  PostImage.init({
    urlImagen: { type: DataTypes.STRING, allowNull: false }
  }, { sequelize, modelName: 'PostImage', tableName: 'Post_Images' });
  return PostImage;
};