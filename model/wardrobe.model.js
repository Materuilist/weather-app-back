import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";
import Garment from "./garment.model.js";
import User from "./user.model.js";

const Wardrobe = sequalize.define("Wardrobe", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  garmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

User.belongsToMany(Garment, {
  as: "wardrobeGarments",
  through: Wardrobe,
  foreignKey: "userId",
  otherKey: "garmentId",
});
Garment.belongsToMany(User, {
  as: "owners",
  through: Wardrobe,
  foreignKey: "garmentId",
  otherKey: "userId",
});

export default Wardrobe;
