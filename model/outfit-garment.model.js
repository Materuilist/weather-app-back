import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";
import Garment from "./garment.model.js";
import User from "./user.model.js";
import Outfit from "./outfit.model.js";

const OutfitGarment = sequalize.define("OutfitGarment", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  outfitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  garmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Outfit.belongsToMany(Garment, {
  as: "outfitGarments",
  through: OutfitGarment,
  foreignKey: "outfitId",
  otherKey: "garmentId",
});
Garment.belongsToMany(Outfit, {
  as: "outfits",
  through: OutfitGarment,
  foreignKey: "garmentId",
  otherKey: "outfitId",
});

export default OutfitGarment;
