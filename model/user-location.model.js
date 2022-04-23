import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";
import Activity from "./activity.model.js";
import Garment from "./garment.model.js";
import Outfit from "./outfit.model.js";

const UserLocation = sequalize.define("UserLocation", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  naming: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

UserLocation.hasMany(Activity, {
  foreignKey: "userLocationId",
  as: "userLocation",
});
Activity.belongsTo(UserLocation, {
  foreignKey: "userLocationId",
  as: "userLocation",
});

export default UserLocation;
