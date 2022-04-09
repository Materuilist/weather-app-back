import { DataTypes } from "sequelize";

import sequalize from "../utils/database.js";
import User from "./user.model.js";

const Role = sequalize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
});
User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

export default Role;
