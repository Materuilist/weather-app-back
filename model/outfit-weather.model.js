import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";
import Garment from "./garment.model.js";
import User from "./user.model.js";
import Outfit from "./outfit.model.js";
import Weather from "./weather.model.js";

const OutfitWeather = sequalize.define("OutfitWeather", {
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
  weatherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Outfit.belongsToMany(Weather, {
  as: "outfitWeathers",
  through: OutfitWeather,
  foreignKey: "outfitId",
  otherKey: "weatherId",
});
Weather.belongsToMany(Outfit, {
  as: "userOutfits",
  through: OutfitWeather,
  foreignKey: "weatherId",
  otherKey: "outfitId",
});

export default OutfitWeather;
