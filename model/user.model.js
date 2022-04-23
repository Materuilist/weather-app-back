import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";
import Garment from "./garment.model.js";
import Outfit from "./outfit.model.js";
import UserLocation from "./user-location.model.js";

const User = sequalize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sex: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

User.hasMany(Outfit, {
  foreignKey: "userId",
  as: "outfits",
});
Outfit.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(UserLocation, {
  foreignKey: "userId",
  as: "user",
});
UserLocation.belongsTo(User, {
  foreignKey: "userId",
  as: "userLocations",
});

export default User;
