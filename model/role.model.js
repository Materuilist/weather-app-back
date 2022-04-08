import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";
import User from "./user.model.js";

const Role = sequalize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Role.hasMany(User, {
  foreignKey: "roleId",
});
User.belongsTo(Role);

export default Role;
