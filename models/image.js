import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Comment } from "./comment.js";
import { User } from "./user.js";

export const Image = sequelize.define("Image", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  picture: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

Image.hasMany(Comment);
Comment.belongsTo(Image);
User.hasMany(Image);
User.hasMany(Comment);
Image.belongsTo(User);
Comment.belongsTo(User);
